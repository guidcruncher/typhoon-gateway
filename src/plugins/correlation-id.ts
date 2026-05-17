let counter = 0

export const correlationIdPlugin = () => {
  const ts = Date.now()
  counter = (counter + 1) & 0xffff // keep it small + fast
  const rand = Math.random().toString(16).slice(2, 8)
  return `ty-${ts}-${counter}-${rand}`
}
