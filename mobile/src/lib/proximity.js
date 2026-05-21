export const TIER = {
  GHOST: 5000,
  AURA: 3000,
  ECHO: 1000,
  HOOK: 200,
};

export function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** @returns {1|2|3|4|5} */
export function getTier(distance) {
  if (distance > TIER.GHOST) return 1;
  if (distance > TIER.AURA) return 2;
  if (distance > TIER.ECHO) return 3;
  if (distance > TIER.HOOK) return 4;
  return 5;
}

export function categoryColor(type) {
  const category = type?.toLowerCase();
  if (category === 'art') return '#ec4899';
  if (category === 'party') return '#22c55e';
  if (category === 'music') return '#f59e0b';
  if (category === 'food') return '#fb923c';
  if (category === 'gaming') return '#06b6d4';
  if (category === 'giveaway') return '#f8fafc';
  if (category === 'fitness') return '#10b981';
  return '#94a3b8';
}

export function formatDistance(distance) {
  if (distance < 1000) return `${Math.round(distance)}m`;
  return `${(distance / 1000).toFixed(1)}km`;
}

/**
 * Tier-aware display fields for lists, map callouts, and modals.
 * @param {object} buzz - buzz with distance (meters)
 * @param {{ isUnlocked?: boolean }} options
 */
export function getBuzzDisplay(buzz, options = {}) {
  const { isUnlocked = false } = options;
  const distance = buzz.distance ?? 0;
  const tier = getTier(distance);

  if (tier === 1) {
    return { visible: false, tier, distance, headline: '', subtitle: '', body: '', calloutTitle: '', calloutBody: '', markerMode: 'hidden' };
  }

  if (tier === 2) {
    return {
      visible: true,
      tier,
      distance,
      headline: `${buzz.type} signal`,
      subtitle: 'Distant aura detected',
      body: 'Move closer to intercept zone data.',
      calloutTitle: buzz.type?.toUpperCase() || 'SIGNAL',
      calloutBody: 'Aura only — approach to learn more.',
      markerMode: 'aura',
      showTypeOnly: true,
    };
  }

  if (tier === 3) {
    return {
      visible: true,
      tier,
      distance,
      headline: buzz.zone || 'Unknown zone',
      subtitle: `${buzz.type?.toUpperCase() || 'SIGNAL'} • Echo`,
      body: buzz.zone ? `Signals in ${buzz.zone}. Move closer to intercept data.` : 'Faint signal — move closer.',
      calloutTitle: buzz.zone || buzz.type,
      calloutBody: buzz.type?.toUpperCase() || 'ECHO',
      markerMode: 'echo',
      icon: buzz.icon || '📍',
    };
  }

  if (tier === 4) {
    return {
      visible: true,
      tier,
      distance,
      headline: 'Teaser intercepted',
      subtitle: buzz.zone || buzz.type,
      body: buzz.teaser ? `"${buzz.teaser}"` : 'Encrypted teaser — keep walking.',
      calloutTitle: buzz.zone || 'Teaser',
      calloutBody: buzz.teaser || 'Hook unlocked — approach for full reveal.',
      markerMode: 'hook',
      icon: buzz.icon || '🪝',
    };
  }

  // Tier 5
  const secretLocked = buzz.isSecret && !isUnlocked;
  return {
    visible: true,
    tier,
    distance,
    headline: secretLocked ? 'SECRET EVENT' : buzz.title,
    subtitle: secretLocked
      ? `${buzz.type?.toUpperCase() || 'PARTY'} • Locked`
      : `${buzz.host || 'Host'} • ${formatDistance(distance)}`,
    body: secretLocked ? buzz.teaser || 'Password required at the door.' : buzz.description || '',
    calloutTitle: secretLocked ? 'SECRET EVENT' : buzz.title,
    calloutBody: secretLocked ? 'Knock to unlock' : buzz.description?.slice(0, 80) || '',
    markerMode: secretLocked ? 'secret' : 'target',
    icon: buzz.icon || '📍',
    canUnlock: buzz.isSecret && !isUnlocked,
    showFullDetail: !secretLocked,
    host: buzz.host,
    image: buzz.image,
    isVerifiedSource: buzz.isVerifiedSource,
  };
}

export function getIntelLabel(buzz, isUnlocked = false) {
  const display = getBuzzDisplay(buzz, { isUnlocked });
  if (display.tier >= 5 && !display.canUnlock) return buzz.title;
  if (display.tier >= 3 && buzz.zone) return `${buzz.type} in ${buzz.zone}`;
  if (display.tier === 2) return `${buzz.type} reveal`;
  return buzz.type || 'Signal';
}

export function processBuzzes(rawBuzzes, lat, lng) {
  return rawBuzzes
    .map(buzz => ({
      ...buzz,
      distance: getDistanceInMeters(lat, lng, buzz.lat, buzz.lng),
    }))
    .filter(b => getTier(b.distance) > 1)
    .sort((a, b) => a.distance - b.distance);
}
