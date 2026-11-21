const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

function extractYouTubeId(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (YOUTUBE_ID_REGEX.test(trimmed)) return trimmed;

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) return null;
  const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
  let candidate = null;

  if (host === 'youtu.be') {
    candidate = parsed.pathname.split('/').filter(Boolean)[0] || null;
  } else if (['youtube.com', 'm.youtube.com', 'music.youtube.com'].includes(host)) {
    if (parsed.pathname === '/watch') {
      candidate = parsed.searchParams.get('v');
    } else {
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (['embed', 'v', 'shorts', 'live'].includes(parts[0])) {
        candidate = parts[1] || null;
      }
    }
  } else {
    return null;
  }

  return candidate && YOUTUBE_ID_REGEX.test(candidate) ? candidate : null;
}

function validateYouTubeVideo(req, res, next) {
  const input = req.body.video_path ?? req.body.video_url;
  if (input === undefined || input === null || String(input).trim() === '') {
    return next();
  }

  const videoId = extractYouTubeId(String(input));
  if (!videoId) {
    return res.status(400).json({
      success: false,
      message: 'Link video không hợp lệ. Chỉ chấp nhận đường dẫn video YouTube.',
    });
  }

  req.body.video_path = `https://www.youtube.com/embed/${videoId}`;
  return next();
}

module.exports = { validateYouTubeVideo };
//AI-assisted: <Gemini> [AI-01]