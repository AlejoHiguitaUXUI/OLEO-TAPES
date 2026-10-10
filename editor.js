/* ============================================================
   OLEO TAPES — Card Editor · editor.js
   ============================================================ */

(function () {
  'use strict';

  // ── Default image ──────────────────────────────────────────
  const DEFAULT_IMAGE = (typeof window !== 'undefined' && window.DEFAULT_ARTIST_IMAGE)
    ? window.DEFAULT_ARTIST_IMAGE
    : 'default_artist.jpeg';

  // ── Current state ──────────────────────────────────────────
  let currentStars = 5;
  let currentImageSrc = DEFAULT_IMAGE;
  let currentScale    = 2;   // default: 2×

  // ── DOM refs ───────────────────────────────────────────────
  const $ = id => document.getElementById(id);

  // Card elements
  const cardCanvas       = $('card-canvas');
  const cardBgImage      = $('card-bg-image');
  const cardDarkOverlay  = $('card-dark-overlay');
  const cardHeaderOverlay= $('card-header-overlay');
  const cardBrand        = $('card-brand');
  const cardTitle        = $('card-title');
  const cardSubtitle     = $('card-subtitle');
  const cardArtistBlock  = $('card-artist-block');
  const cardArtistName   = $('card-artist-name');
  const cardStars        = $('card-stars');
  const cardQuote        = $('card-quote');
  const cardFooter       = $('card-footer');
  const footerLeftText   = $('footer-left-text');
  const footerGlobe      = $('footer-globe');
  const footerCatalog    = $('footer-catalog-preview');
  const footerTagline    = $('footer-tagline-preview');

  // Editor inputs
  const inBrandLine       = $('brand-line');
  const inReleaseTitle    = $('release-title');
  const inSubtitleLine    = $('subtitle-line');
  const inHeaderColor     = $('header-color');
  const inSubtitleColor   = $('subtitle-color');
  const toggleHeader      = $('toggle-header');
  // Typography controls
  const inBrandSize       = $('brand-size');
  const inTitleSize       = $('title-size');
  const inSubtitleSize    = $('subtitle-size');
  const inHeaderLH        = $('header-line-height');
  const inHeaderWeight    = $('header-weight');
  const toggleWrapHeader  = $('toggle-wrap-header');
  const toggleWrapSubtitle= $('toggle-wrap-subtitle');

  const uploadZone        = $('upload-zone');
  const imgUpload         = $('img-upload');
  const inImgPosition     = $('img-position');
  const inImgZoom         = $('img-zoom');
  const inOverlayOpacity  = $('overlay-opacity');

  const inArtistName      = $('artist-name');
  const starsEditor       = $('stars-editor');
  const inStarColor       = $('star-color');
  const inQuoteText       = $('quote-text');
  const inArtistColor     = $('artist-color');
  const inQuoteColor      = $('quote-color');
  const inReviewBgOpacity = $('review-bg-opacity');
  const toggleArtist      = $('toggle-artist');

  // Footer — solo catálogo es editable
  const inFooterCatalog   = $('footer-catalog-input');

  const btnReset          = $('btn-reset');
  const btnPng            = $('btn-download-png');
  const btnJpg            = $('btn-download-jpg');
  const toast             = $('toast');

  // ── Init ───────────────────────────────────────────────────
  function init() {
    setDefaultImage();
    bindAllInputs();
    bindStarsEditor();
    bindScaleSelector();
    bindImageUpload();
    bindExport();
    bindReset();
    syncAll();
  }

  function setDefaultImage() {
    cardBgImage.style.backgroundImage = `url('${DEFAULT_IMAGE}')`;
  }

  // ── Sync all fields → card ──────────────────────────────────
  function syncAll() {
    syncHeader();
    syncImage();
    syncArtist();
    syncFooter();
  }

  function syncHeader() {
    // Text content
    cardBrand.textContent    = inBrandLine.value;
    cardTitle.textContent    = inReleaseTitle.value;
    cardSubtitle.textContent = inSubtitleLine.value;

    // Colors
    cardBrand.style.color    = inHeaderColor.value;
    cardTitle.style.color    = inHeaderColor.value;
    cardSubtitle.style.color = inSubtitleColor.value;

    // Font sizes (px)
    const brandSz    = parseInt(inBrandSize.value,    10) || 20;
    const titleSz    = parseInt(inTitleSize.value,    10) || 26;
    const subtitleSz = parseInt(inSubtitleSize.value, 10) || 14;
    cardBrand.style.fontSize    = brandSz    + 'px';
    cardTitle.style.fontSize    = titleSz    + 'px';
    cardSubtitle.style.fontSize = subtitleSz + 'px';
    $('brand-size-val').textContent    = brandSz;
    $('title-size-val').textContent    = titleSz;
    $('subtitle-size-val').textContent = subtitleSz;

    // Font weight (Organetto variants)
    const weight = inHeaderWeight.value;
    cardBrand.style.fontWeight = weight;
    cardTitle.style.fontWeight = weight;

    // Line-height (applied to the overlay container)
    const lh = parseFloat(inHeaderLH.value).toFixed(2);
    cardBrand.style.lineHeight    = lh;
    cardTitle.style.lineHeight    = lh;
    $('header-lh-val').textContent = lh;

    // Wrap toggle
    const wrapHeader   = toggleWrapHeader.checked;
    const wrapSubtitle = toggleWrapSubtitle.checked;
    cardBrand.style.whiteSpace    = wrapHeader   ? 'normal' : 'nowrap';
    cardTitle.style.whiteSpace    = wrapHeader   ? 'normal' : 'nowrap';
    cardSubtitle.style.whiteSpace = wrapSubtitle ? 'normal' : 'nowrap';

    // Visibility
    cardHeaderOverlay.classList.toggle('hidden', !toggleHeader.checked);

    updateHex('header-color-hex',   inHeaderColor.value);
    updateHex('subtitle-color-hex', inSubtitleColor.value);
  }

  function syncImage() {
    const pos  = inImgPosition.value;
    const zoom = inImgZoom.value;
    const opacity = inOverlayOpacity.value;

    cardBgImage.style.backgroundPosition = `center ${pos}%`;
    cardBgImage.style.backgroundSize     = `${zoom}%`;
    cardDarkOverlay.style.background     = `rgba(0,0,0,${opacity / 100})`;

    $('img-pos-val').textContent  = pos + '%';
    $('img-zoom-val').textContent = zoom + '%';
    $('overlay-val').textContent  = opacity + '%';
  }

  function syncArtist() {
    cardArtistName.textContent = inArtistName.value;
    cardArtistName.style.color = inArtistColor.value;
    cardQuote.textContent      = inQuoteText.value;
    cardQuote.style.color      = inQuoteColor.value;

    // Stars
    const starColor = inStarColor.value;
    const starEls   = cardStars.querySelectorAll('.star');
    starEls.forEach((s, i) => {
      s.style.color   = i < currentStars ? starColor : 'rgba(255,255,255,0.12)';
      s.style.opacity = i < currentStars ? '1' : '0.25';
    });

    // Review bg opacity
    const bgAlpha = (parseInt(inReviewBgOpacity.value) / 100).toFixed(2);
    cardArtistBlock.style.background = `rgba(0,0,0,${bgAlpha})`;

    cardArtistBlock.classList.toggle('hidden', !toggleArtist.checked);

    updateHex('star-color-hex',   inStarColor.value);
    updateHex('artist-color-hex', inArtistColor.value);
    updateHex('quote-color-hex',  inQuoteColor.value);
    $('review-bg-val').textContent = inReviewBgOpacity.value + '%';
  }

  function syncFooter() {
    // Solo el número de catálogo es editable; todo lo demás es fijo.
    footerCatalog.textContent = inFooterCatalog.value;
  }

  // ── Helpers ────────────────────────────────────────────────
  function updateHex(id, value) {
    const el = $(id);
    if (el) el.textContent = value;
  }

  // ── Bind all plain inputs ───────────────────────────────────
  function bindAllInputs() {
    // Header — text + colors + typography controls
    [
      inBrandLine, inReleaseTitle, inSubtitleLine,
      inHeaderColor, inSubtitleColor, toggleHeader,
      inBrandSize, inTitleSize, inSubtitleSize,
      inHeaderLH, inHeaderWeight,
      toggleWrapHeader, toggleWrapSubtitle
    ].forEach(el => el.addEventListener('input', syncHeader));

    // Image
    [inImgPosition, inImgZoom, inOverlayOpacity]
      .forEach(el => el.addEventListener('input', syncImage));

    // Artist
    [inArtistName, inStarColor, inQuoteText, inArtistColor, inQuoteColor, inReviewBgOpacity, toggleArtist]
      .forEach(el => el.addEventListener('input', syncArtist));

    // Footer — solo catálogo
    inFooterCatalog.addEventListener('input', syncFooter);
  }

  // ── Stars editor ────────────────────────────────────────────
  function bindStarsEditor() {
    const starBtns = starsEditor.querySelectorAll('.star-btn');

    starBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.dataset.val, 10);

        // If clicking the current active count, toggle off (0 stars)
        if (val === currentStars) {
          currentStars = 0;
        } else {
          currentStars = val;
        }

        // Update button states
        starBtns.forEach(b => {
          const bVal = parseInt(b.dataset.val, 10);
          b.classList.toggle('active', bVal <= currentStars);
        });

        // Update card
        updateCardStarCount();
        syncArtist();
      });

      // Hover preview
      btn.addEventListener('mouseenter', () => {
        const hoverVal = parseInt(btn.dataset.val, 10);
        starBtns.forEach(b => {
          b.style.color = parseInt(b.dataset.val, 10) <= hoverVal
            ? inStarColor.value
            : 'var(--text-faint)';
        });
      });
      btn.addEventListener('mouseleave', () => {
        starBtns.forEach(b => {
          b.style.color = '';
        });
      });
    });
  }

  function updateCardStarCount() {
    // Rebuild stars in card based on currentStars
    cardStars.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
      const span = document.createElement('span');
      span.className = 'star';
      span.textContent = '★';
      if (i > currentStars) {
        span.style.opacity = '0.15';
      }
      cardStars.appendChild(span);
    }
  }

  // ── Scale selector ──────────────────────────────────────────
  function bindScaleSelector() {
    const scaleBtns = document.querySelectorAll('.scale-btn');
    scaleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        scaleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentScale = parseInt(btn.dataset.scale, 10);
        showToast(`Escala: ${currentScale}×`);
      });
    });
  }

  // ── Image upload ────────────────────────────────────────────
  function bindImageUpload() {
    uploadZone.addEventListener('click', () => imgUpload.click());

    uploadZone.addEventListener('dragover', e => {
      e.preventDefault();
      uploadZone.style.borderColor = 'var(--gold)';
      uploadZone.style.background  = 'rgba(201,168,76,0.08)';
    });

    uploadZone.addEventListener('dragleave', () => {
      uploadZone.style.borderColor = '';
      uploadZone.style.background  = '';
    });

    uploadZone.addEventListener('drop', e => {
      e.preventDefault();
      uploadZone.style.borderColor = '';
      uploadZone.style.background  = '';
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) loadImageFile(file);
    });

    imgUpload.addEventListener('change', () => {
      if (imgUpload.files[0]) loadImageFile(imgUpload.files[0]);
    });
  }

  function loadImageFile(file) {
    const reader = new FileReader();
    reader.onload = e => {
      currentImageSrc = e.target.result;
      cardBgImage.style.backgroundImage = `url('${currentImageSrc}')`;

      // Update upload zone label
      uploadZone.querySelector('.upload-text').textContent = file.name;
      uploadZone.style.borderColor = 'var(--gold)';
      setTimeout(() => { uploadZone.style.borderColor = ''; }, 2000);

      showToast('Imagen cargada correctamente');
    };
    reader.readAsDataURL(file);
  }

  // ── Native Canvas Renderer & Export ────────────────────────
  function bindExport() {
    btnPng.addEventListener('click', () => exportCard('png'));
    btnJpg.addEventListener('click', () => exportCard('jpeg'));
  }

  function getWrappedLines(ctx, text, maxWidth) {
    if (!text) return [];
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? currentLine + ' ' + word : word;
      const testWidth = ctx.measureText(testLine).width;
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  }

  function renderTextWrapped(ctx, text, x, y, maxWidth, lineHeight) {
    const lines = getWrappedLines(ctx, text, maxWidth);
    let curY = y;
    for (const line of lines) {
      ctx.fillText(line, x, curY);
      curY += lineHeight;
    }
    return curY;
  }

  function renderTextSpaced(ctx, text, x, y, spacing) {
    let curX = x;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      ctx.fillText(char, curX, y);
      curX += ctx.measureText(char).width + spacing;
    }
  }

  async function renderCardToCanvas(scale = 2) {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    const cardEl = cardCanvas;
    const baseW = cardEl.offsetWidth || 480;
    const baseH = cardEl.offsetHeight || 576;
    const width = Math.round(baseW * scale);
    const height = Math.round(baseH * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');

    // Fill base background color
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // 1. Draw background image
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Error al cargar imagen'));
      img.src = currentImageSrc;
    });

    const zoomPct = (parseInt(inImgZoom.value, 10) || 100) / 100;
    const posPct = (parseInt(inImgPosition.value, 10) || 50) / 100;

    const imgRatio = img.width / img.height;
    const cardRatio = width / height;
    let drawW, drawH;
    // Ensure export matches the CSS background-size: ${zoom}% behavior exactly (width is scaled, height is auto)
    drawW = width * zoomPct;
    drawH = drawW / imgRatio;

    const drawX = (width - drawW) / 2;
    const drawY = (height - drawH) * posPct;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    // 2. Linear gradient scrim (top to bottom)
    const scrimGrad = ctx.createLinearGradient(0, 0, 0, height);
    scrimGrad.addColorStop(0.0, 'rgba(0,0,0,0.45)');
    scrimGrad.addColorStop(0.5, 'rgba(0,0,0,0.00)');
    scrimGrad.addColorStop(0.6, 'rgba(0,0,0,0.00)');
    scrimGrad.addColorStop(1.0, 'rgba(0,0,0,0.65)');
    ctx.fillStyle = scrimGrad;
    ctx.fillRect(0, 0, width, height);

    // 3. Dark overlay
    const overlayOpacity = (parseInt(inOverlayOpacity.value, 10) || 35) / 100;
    if (overlayOpacity > 0) {
      ctx.fillStyle = `rgba(0,0,0,${overlayOpacity})`;
      ctx.fillRect(0, 0, width, height);
    }

    // 4. Cabezote / Header Overlay
    if (toggleHeader.checked) {
      const headerPaddingX = 22 * scale;
      const headerPaddingY = 22 * scale;
      const brandSz = (parseInt(inBrandSize.value, 10) || 20) * scale;
      const titleSz = (parseInt(inTitleSize.value, 10) || 26) * scale;
      const subtitleSz = (parseInt(inSubtitleSize.value, 10) || 14) * scale;
      const headerWeight = inHeaderWeight.value || '900';
      const headerLH = parseFloat(inHeaderLH.value) || 1.30;
      const headerColor = inHeaderColor.value || '#c9a84c';
      const subtitleColor = inSubtitleColor.value || '#9e8a5f';
      const wrapHeader = toggleWrapHeader.checked;

      let currentY = headerPaddingY;

      // Brand Line
      const brandText = inBrandLine.value.toUpperCase();
      if (brandText) {
        ctx.save();
        ctx.font = `${headerWeight} ${brandSz}px Organetto, 'Barlow Condensed', sans-serif`;
        ctx.fillStyle = headerColor;
        ctx.shadowColor = 'rgba(0,0,0,0.75)';
        ctx.shadowBlur = 10 * scale;
        ctx.shadowOffsetX = 2 * scale;
        ctx.shadowOffsetY = 2 * scale;
        ctx.textBaseline = 'top';

        if (wrapHeader) {
          currentY = renderTextWrapped(ctx, brandText, headerPaddingX, currentY, width - 2 * headerPaddingX, brandSz * headerLH);
        } else {
          ctx.fillText(brandText, headerPaddingX, currentY);
          currentY += brandSz * headerLH;
        }
        ctx.restore();
      }

      // Title Line
      const titleText = inReleaseTitle.value.toUpperCase();
      if (titleText) {
        ctx.save();
        ctx.font = `${headerWeight} ${titleSz}px Organetto, 'Barlow Condensed', sans-serif`;
        ctx.fillStyle = headerColor;
        ctx.shadowColor = 'rgba(0,0,0,0.75)';
        ctx.shadowBlur = 10 * scale;
        ctx.shadowOffsetX = 2 * scale;
        ctx.shadowOffsetY = 2 * scale;
        ctx.textBaseline = 'top';

        currentY += 3 * scale;
        if (wrapHeader) {
          currentY = renderTextWrapped(ctx, titleText, headerPaddingX, currentY, width - 2 * headerPaddingX, titleSz * headerLH);
        } else {
          ctx.fillText(titleText, headerPaddingX, currentY);
          currentY += titleSz * headerLH;
        }
        ctx.restore();
      }

      // Subtitle Line
      const subtitleText = inSubtitleLine.value.toUpperCase();
      if (subtitleText) {
        ctx.save();
        ctx.font = `300 ${subtitleSz}px 'Inter', sans-serif`;
        ctx.fillStyle = subtitleColor;
        ctx.textBaseline = 'top';
        currentY += 6 * scale;

        const letterSpacing = subtitleSz * 0.35;
        renderTextSpaced(ctx, subtitleText, headerPaddingX, currentY, letterSpacing);
        ctx.restore();
      }
    }

    // 5. Artist Review Block
    const footerHeight = 62 * scale;
    if (toggleArtist.checked) {
      const reviewPaddingX = 22 * scale;
      const reviewPaddingTop = 14 * scale;
      const reviewPaddingBottom = 16 * scale;
      const artistColor = inArtistColor.value || '#ffffff';
      const quoteColor = inQuoteColor.value || '#e8e8e8';
      const starColor = inStarColor.value || '#d4a017';
      const bgAlpha = (parseInt(inReviewBgOpacity.value, 10) || 47) / 100;

      const artistSz = Math.round(28 * scale);
      const starSz = Math.round(22 * scale);
      const quoteSz = Math.round(13.5 * scale);
      const quoteLH = quoteSz * 1.5;

      const artistName = (inArtistName.value || '').toUpperCase();
      const quoteText = inQuoteText.value || '';

      ctx.save();
      ctx.font = `italic 400 ${quoteSz}px 'Inter', sans-serif`;
      const quoteLines = getWrappedLines(ctx, quoteText, width - 2 * reviewPaddingX);
      const quoteHeight = quoteLines.length * quoteLH;
      ctx.restore();

      const boxContentHeight = artistSz + (8 * scale) + starSz + (6 * scale) + quoteHeight;
      const boxTotalHeight = reviewPaddingTop + boxContentHeight + reviewPaddingBottom;
      const boxY = height - footerHeight - boxTotalHeight;

      ctx.fillStyle = `rgba(0,0,0,${bgAlpha})`;
      ctx.fillRect(0, boxY, width, boxTotalHeight);

      let textY = boxY + reviewPaddingTop;

      // Artist name
      if (artistName) {
        ctx.save();
        ctx.font = `700 ${artistSz}px 'Oswald', sans-serif`;
        ctx.fillStyle = artistColor;
        ctx.textBaseline = 'top';
        ctx.fillText(artistName, reviewPaddingX, textY);
        textY += artistSz + (8 * scale);
        ctx.restore();
      }

      // 5 Stars
      ctx.save();
      ctx.font = `${starSz}px sans-serif`;
      ctx.textBaseline = 'top';
      let starX = reviewPaddingX;
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = i < currentStars ? starColor : 'rgba(255,255,255,0.25)';
        ctx.fillText('★', starX, textY);
        starX += ctx.measureText('★').width + (4 * scale);
      }
      textY += starSz + (6 * scale);
      ctx.restore();

      // Quote text
      if (quoteText) {
        ctx.save();
        ctx.font = `italic 400 ${quoteSz}px 'Inter', sans-serif`;
        ctx.fillStyle = quoteColor;
        ctx.textBaseline = 'top';
        for (const line of quoteLines) {
          ctx.fillText(line, reviewPaddingX, textY);
          textY += quoteLH;
        }
        ctx.restore();
      }
    }

    // 6. Card Footer
    const footerY = height - footerHeight;
    ctx.fillStyle = '#e8dfc8';
    ctx.fillRect(0, footerY, width, footerHeight);

    const footerPaddingX = 18 * scale;
    const footerCenterY = footerY + footerHeight / 2;

    // Left Footer: "ARTIST WORLDWIDE •" + Globe + " | " + Catalog
    ctx.save();
    ctx.fillStyle = '#2a2a2a';
    ctx.textBaseline = 'middle';
    ctx.font = `500 ${10 * scale}px 'Inter', sans-serif`;

    const leftText = (footerLeftText ? footerLeftText.textContent : 'ARTIST WORLDWIDE •').trim() + ' ';
    ctx.fillText(leftText, footerPaddingX, footerCenterY);
    let curFooterX = footerPaddingX + ctx.measureText(leftText).width + (3 * scale);

    // Globe icon
    const globeRadius = 7 * scale;
    const globeCenterY = footerCenterY;
    const globeCenterX = curFooterX + globeRadius;

    ctx.save();
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1.8 * scale;
    ctx.globalAlpha = 0.7;

    // Outer circle
    ctx.beginPath();
    ctx.arc(globeCenterX, globeCenterY, globeRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Vertical ellipse
    ctx.beginPath();
    ctx.ellipse(globeCenterX, globeCenterY, globeRadius * 0.4, globeRadius, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Latitudes
    ctx.beginPath();
    ctx.moveTo(globeCenterX - globeRadius * 0.85, globeCenterY - globeRadius * 0.4);
    ctx.lineTo(globeCenterX + globeRadius * 0.85, globeCenterY - globeRadius * 0.4);
    ctx.moveTo(globeCenterX - globeRadius * 0.85, globeCenterY + globeRadius * 0.4);
    ctx.lineTo(globeCenterX + globeRadius * 0.85, globeCenterY + globeRadius * 0.4);
    ctx.stroke();
    ctx.restore();

    curFooterX += (globeRadius * 2) + (6 * scale);

    // Divider |
    ctx.font = `500 ${10 * scale}px 'Inter', sans-serif`;
    ctx.globalAlpha = 0.5;
    ctx.fillText('|', curFooterX, footerCenterY);
    ctx.globalAlpha = 1.0;
    curFooterX += ctx.measureText('|').width + (6 * scale);

    // Catalog (e.g. OT002)
    const catalogStr = inFooterCatalog ? inFooterCatalog.value : 'OT002';
    ctx.font = `800 ${11 * scale}px 'Inter', sans-serif`;
    ctx.fillText(catalogStr, curFooterX, footerCenterY);
    ctx.restore();

    // Right Tagline: "Glitch is the groove. Colombia."
    ctx.save();
    ctx.fillStyle = '#2a2a2a';
    ctx.font = `600 ${14.5 * scale}px 'Caveat', cursive`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText('Glitch is the groove. Colombia.', width - footerPaddingX, footerCenterY);
    ctx.restore();

    return canvas;
  }

  async function exportCard(format) {
    btnPng.disabled = true;
    btnJpg.disabled = true;
    showToast('Generando imagen...');

    try {
      const canvas = await renderCardToCanvas(currentScale);
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const quality  = format === 'png' ? 1.0 : 0.95;
      const dataUrl  = canvas.toDataURL(mimeType, quality);

      const link = document.createElement('a');
      link.href     = dataUrl;
      link.download = `oleo-tapes-card-${currentScale}x-${Date.now()}.${format === 'png' ? 'png' : 'jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`${format.toUpperCase()} ${currentScale}× — ${canvas.width}×${canvas.height}px`);
    } catch (err) {
      console.error('Export error:', err);
      showToast('Error al exportar');
    } finally {
      btnPng.disabled = false;
      btnJpg.disabled = false;
    }
  }

  // ── Reset ───────────────────────────────────────────────────
  function bindReset() {
    btnReset.addEventListener('click', () => {
      if (!confirm('¿Resetear todos los valores al estado original?')) return;

      inBrandLine.value      = 'OLEO TAPES';
      inReleaseTitle.value   = 'NFX57 — FICTION';
      inSubtitleLine.value   = 'DJ SUPPORT';
      inHeaderColor.value    = '#c9a84c';
      inSubtitleColor.value  = '#9e8a5f';
      toggleHeader.checked   = true;
      // Typography defaults
      inBrandSize.value          = '20';
      inTitleSize.value          = '26';
      inSubtitleSize.value       = '14';
      inHeaderLH.value           = '1.30';
      inHeaderWeight.value       = '900';
      toggleWrapHeader.checked   = false;
      toggleWrapSubtitle.checked = false;

      inImgPosition.value    = '50';
      inImgZoom.value        = '100';
      inOverlayOpacity.value = '35';
      currentImageSrc        = DEFAULT_IMAGE;
      cardBgImage.style.backgroundImage = `url('${DEFAULT_IMAGE}')`;
      uploadZone.querySelector('.upload-text').textContent = 'Arrastra o haz clic para subir';

      inArtistName.value     = 'BEN SIMS';
      currentStars           = 5;
      inStarColor.value      = '#d4a017';
      inQuoteText.value      = '"Such a great track, thanks for sharing. Love this!"';
      inArtistColor.value    = '#ffffff';
      inQuoteColor.value     = '#e8e8e8';
      inReviewBgOpacity.value= '47';
      toggleArtist.checked   = true;

      inFooterCatalog.value  = 'OT002';

      // Reset star buttons
      starsEditor.querySelectorAll('.star-btn').forEach(b => {
        b.classList.add('active');
      });
      updateCardStarCount();
      syncAll();
      showToast('Valores reseteados');
    });
  }

  // ── Toast ───────────────────────────────────────────────────
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  // ── Run ─────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', init);

})();
