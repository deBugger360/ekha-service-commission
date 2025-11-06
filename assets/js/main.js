(async function () {
  const params = new URLSearchParams(window.location.search);
  const idParam = params.get('id');
  const id = idParam ? Number(idParam) : null;

  if (!id) {
    console.error('No commissioner id provided in URL');
    return;
  }

  try {
    // fetch as text to allow stripping leading comment lines (the file currently includes a // filepath header)
    let text = await fetch('./commission.json', { cache: 'no-store' }).then(r => {
      if (!r.ok) throw new Error('Failed to fetch commission.json');
      return r.text();
    });

    // remove single-line // comments (safe for the current file)
    text = text.replace(/^\s*\/\/.*$/mg, '').trim();

    const data = JSON.parse(text);

    const commissioner = data.find(c => Number(c.id) === id);
    if (!commissioner) {
      console.error('Commissioner not found for id', id);
      return;
    }

    // helpers
    const setText = (elId, value) => {
      const el = document.getElementById(elId);
      if (!el) return;
      el.textContent = value || '—';
    };

    //to title case
    function toTitleCase(str) {
        return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    // image
    const imgEl = document.getElementById('commissioner-image');
    if (imgEl) {
      imgEl.src = commissioner.user_avatar || 'assets/image/team/hon-eng-kayode-fasakin-chairman-ekha-sc.jpeg';
      imgEl.alt = commissioner.full_name || 'Commissioner';
    }

    // basic fields
    setText('commissioner-name', commissioner.full_name);
    setText('commissioner-position', commissioner.current_position);
    setText('commissioner-headername', toTitleCase(commissioner.full_name));

    // --- banner short name (team-details-name) -> first name after "Hon." / "Hon. (Mrs)" ---
    const bannerNameEl = document.getElementById('team-name'); // element added manually in markup
    if (bannerNameEl) {
      (function setBannerFirstName(fullName) {
        if (!fullName) {
          bannerNameEl.textContent = '';
          return;
        }
        let name = String(fullName).trim();

        // remove leading "Hon." / "HON." and optional "(MRS)" variants
        name = name.replace(/^\s*hon\.?\s*(\(\s*mrs\s*\))?\s*/i, '');

        // remove any leading parenthetical titles like "(Engr)"
        name = name.replace(/^\(\s*[^)]*\)\s*/, '');

        // first token is first name
        const firstToken = (name.split(/\s+/)[0] || '').trim();

        const display = firstToken
          ? firstToken.charAt(0).toUpperCase() + firstToken.slice(1).toLowerCase()
          : '';

        bannerNameEl.textContent = display;
      })(commissioner.full_name);
    }

    // email (anchor)
    const emailA = document.getElementById('commissioner-email');
    if (emailA) {
      if (commissioner.email_address && commissioner.email_address.trim()) {
        emailA.href = 'mailto:' + commissioner.email_address;
        emailA.textContent = commissioner.email_address;
      } else {
        emailA.removeAttribute('href');
        emailA.textContent = '—';
      }
    }

    setText('commissioner-dob', commissioner.date_of_birth || '—');

    // professional_cert maps to Professional Certifications label
    setText('commissioner-cert', commissioner.professional_cert || '—');

    // Committees: set text and hide section if empty
    setText('commissioner-committees', commissioner.committees || '—');
    const committeesEl = document.getElementById('commissioner-committees');
    if (committeesEl) {
      const committeesSection = committeesEl.closest('.team-details-list');
      if (committeesSection) {
        if (commissioner.committees && commissioner.committees.trim()) {
          committeesSection.style.display = '';
        } else {
          committeesSection.style.display = 'none';
        }
      }
    }

    // political experience: hide section if empty
    const polSection = document.getElementById('political-section');
    if (commissioner.political_xp && commissioner.political_xp.trim()) {
      setText('commissioner-political-xp', commissioner.political_xp);
      if (polSection) polSection.style.display = '';
    } else {
      if (polSection) polSection.style.display = 'none';
    }

  } catch (err) {
    console.error('Error loading commissioner data:', err);
  }
})();