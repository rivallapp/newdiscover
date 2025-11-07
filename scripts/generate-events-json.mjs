import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';

// Paths
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const htmlPath = path.join(root, 'events-raw-data.html');
const outPath = path.join(root, 'events.json');

function parseRawEventsFromDocument(document) {
  const HEADER_RX = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+([A-Za-z]{3,9})\s+(\d{1,2})$/;
  const MONTHS = { jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,sept:9,oct:10,nov:11,dec:12 };

  const headers = Array.from(document.querySelectorAll('div')).filter(el => {
    const t = (el.textContent || '').trim();
    return HEADER_RX.test(t);
  });
  function findPrevHeader(el) {
    let best = null;
    for (const h of headers) {
      const pos = h.compareDocumentPosition(el);
      const { Node } = document.defaultView;
      const precedes = (pos & Node.DOCUMENT_POSITION_FOLLOWING) !== 0 && (pos & Node.DOCUMENT_POSITION_PRECEDING) === 0;
      if (precedes) {
        if (!best) best = h; else {
          const afterBest = (best.compareDocumentPosition(h) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
          if (afterBest) best = h;
        }
      }
    }
    if (!best) return null;
    const m = (best.textContent || '').trim().match(HEADER_RX);
    if (!m) return null;
    const dow = m[1];
    const mon = m[2].toLowerCase();
    const dd = parseInt(m[3], 10);
    const mm = MONTHS[mon] || null;
    const abbrs = { Mon:'Mon', Tue:'Tue', Wed:'Wed', Thu:'Thu', Fri:'Fri', Sat:'Sat', Sun:'Sun' };
    const names = { Mon:'Monday', Tue:'Tuesday', Wed:'Wednesday', Thu:'Thursday', Fri:'Friday', Sat:'Saturday', Sun:'Sunday' };
    return {
      day_abbrev: abbrs[dow] || dow,
      day_label: names[dow] || dow,
      start_date_text: mm ? (m[2].charAt(0).toUpperCase() + m[2].slice(1,3)) + ' ' + dd : (m[2] + ' ' + dd),
      date_mmdd: (mm && dd) ? `${mm}/${dd}` : ''
    };
  }

  const allTab = Array.from(document.querySelectorAll('[tabindex="0"]'));
  const cards = allTab.filter(el => String(el.textContent || '').toLowerCase().includes('event'));
  // Debug output
  if (process.env.DEBUG_EVENTS === '1') {
    const divCount = document.querySelectorAll('div').length;
    const eventLike = allTab.filter(el => (el.textContent || '').includes('Event')).length;
    console.log('DIVs:', divCount, 'tabindex=0:', allTab.length, 'contain "Event":', eventLike, 'headers:', headers.length);
  }
  // Debug counts if running standalone
  // console.log('headers', headers.length, 'cards', cards.length);
  const out = [];
  if (process.env.DEBUG_EVENTS === '1') {
    console.log('cards filtered length:', cards.length);
  }
  cards.forEach((card, idx) => {
    const headerInfo = findPrevHeader(card) || {};
    const texts = Array.from(card.querySelectorAll('div')).map(d => (d.textContent || '').trim()).filter(Boolean);
    if (process.env.DEBUG_EVENTS === '1' && idx === 0) {
      console.log('sample card text snippet:', (card.textContent || '').slice(0, 120).replace(/\s+/g,' '));
    }
    const titleCands = texts.filter(t => /( - )|Watch Party|Tailgate|Crawl|Night|Hurling|Ravens|NFL/i.test(t) && t.length > 10 && t.toLowerCase() !== 'event');
    const noisy = (s) => /\d{1,2}:\d{2}\s*[AaPp][Mm]|\$\d|\d+\/\d+|Club Volo|Baltimore Peninsula|Brewers Hill|Fells Point|Canton|Pigtown|Sound Garden/i.test(s);
    let title = '';
    const cleanedCands = titleCands.filter(t => !noisy(t));
    if (cleanedCands.length) {
      title = cleanedCands.sort((a,b) => a.length - b.length)[0];
    } else if (titleCands.length) {
      // Fallback: trim common noisy tails from the first candidate
      let t = titleCands[0];
      t = t.replace(/\b(Federal Hill|Club Volo [A-Za-z ]+|Canton|Fells Point|Pigtown|Brewers Hill|The Sound Garden - Baltimore)\b.*$/i, '').trim();
      t = t.replace(/\s*\d{1,2}:\d{2}\s*[AaPp][Mm].*$/, '').trim();
      title = t;
    }
    const venueCand = texts.filter(t => /Club Volo|Tailgate|Fells Point|Canton|Federal Hill|Brewers Hill|Pigtown|Sound Garden/i.test(t));
    const venue_name = venueCand.length ? venueCand[venueCand.length - 1] : '';
    const times = [];
    texts.forEach(t => {
      const rx = /(\d{1,2})(?::(\d{2}))?\s*([AaPp][Mm])/g;
      let m;
      while ((m = rx.exec(t)) !== null) {
        const hour = m[1];
        const mins = m[2] || '00';
        const ap = m[3].toUpperCase();
        times.push(`${parseInt(hour,10)}:${mins}${ap}`);
      }
    });
    let time_start = '';
    let time_end = '';
    if (times.length === 1) time_start = times[0];
    else if (times.length > 1) { time_start = times[0]; time_end = times[times.length - 1]; }

    const imgEl = card.querySelector('img');
    const image_url = imgEl ? (imgEl.getAttribute('src') || '') : '';
    const image_alt = imgEl ? (imgEl.getAttribute('alt') || '') : '';

    let price_person_current = null;
    let member_price_current = null;
    const hasMemberWord = texts.some(t => /\bMember\b/i.test(t));
    const hasStandardWord = texts.some(t => /\bStandard\b/i.test(t));
    const dollars = [];
    texts.forEach(t => {
      const m = t.match(/\$(\d+(?:\.\d{1,2})?)/);
      if (m) dollars.push(parseFloat(m[1]));
    });
    if (dollars.length) {
      const amt = dollars[0];
      if (hasMemberWord && (amt === 0 || amt === 0.0)) member_price_current = 0;
      else if (hasStandardWord && (amt === 0 || amt === 0.0)) price_person_current = 0;
      else price_person_current = amt;
    }
    const features = [];
    if (texts.some(t => /Member Exclusive/i.test(t))) features.push('Member Exclusive');
    if (texts.some(t => /Free For Volo Pass/i.test(t))) features.push('Free For Volo Pass');

    out.push({
      program_name: title,
      venue_name,
      start_date_text: headerInfo.start_date_text || '',
      time_start,
      time_end,
      image_url,
      image_alt,
      day_label: headerInfo.day_label || '',
      day_abbrev: headerInfo.day_abbrev || '',
      date_mmdd: headerInfo.date_mmdd || '',
      price_person_current,
      member_price_current,
      features
    });
  });
  return out;
}

async function main() {
  if (!fs.existsSync(htmlPath)) {
    console.error(`Missing ${htmlPath}`);
    process.exit(1);
  }
  const html = fs.readFileSync(htmlPath, 'utf8');
  const dom = new JSDOM(html);
  const { document } = dom.window;
  const items = parseRawEventsFromDocument(document);
  fs.writeFileSync(outPath, JSON.stringify(items, null, 2));
  console.log(`Wrote ${items.length} events to ${outPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
