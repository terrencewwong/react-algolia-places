export default function formatInputValue ({
  administrative,
  city,
  country,
  name,
  type
}) {
  const out = `${name}${type !== 'country' && country !== undefined ? ',' : ''}
 ${city ? `${city},` : ''}
 ${administrative ? `${administrative},` : ''}
 ${country || ''}`
    .replace(/\s*\n\s*/g, ' ')
    .trim()
  return out
}
