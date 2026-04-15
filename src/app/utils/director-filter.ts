export function slugifyDirectorName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');
}

export function reverseDirectorName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) {
    return name;
  }

  const lastName = parts.pop();
  return `${lastName}, ${parts.join(' ')}`;
}

export function getDirectorAliases(slug: string): string[] {
  const aliases = new Set<string>([slug]);

  if (slug === 'powell-pressburger') {
    aliases.add('michael-powell-emeric-pressburger');
    aliases.add('michael-powell-and-emeric-pressburger');
    aliases.add('powell-and-pressburger');
    aliases.add('powell--pressburger');
  }

  if (slug === 'friedrich-murnau' || slug === 'friedrich-w-murnau') {
    aliases.add('friedrich-w-murnau');
    aliases.add('friedrich-wilhelm-murnau');
    aliases.add('fw-murnau');
    aliases.add('f-w-murnau');
    aliases.add('fwmurnau');
    aliases.add('murnau');
  }

  return [...aliases];
}

export function matchesDirectorSlug(directorName: string, slug: string): boolean {
  const normalizedDirector = slugifyDirectorName(directorName);
  const aliases = getDirectorAliases(slug);

  if (aliases.includes(normalizedDirector)) {
    return true;
  }

  if (slug === 'powell-pressburger') {
    return normalizedDirector.includes('powell') || normalizedDirector.includes('pressburger');
  }

  if (slug === 'friedrich-murnau' || slug === 'friedrich-w-murnau') {
    return normalizedDirector.includes('murnau');
  }

  return false;
}
