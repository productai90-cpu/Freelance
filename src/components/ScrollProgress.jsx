import { motion, useScroll, useSpring } from 'motion/react'

/** A 1px accent rule tracking read position. Scroll-linked, so it costs
    nothing per frame beyond a transform. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const width = useSpring(scrollYProgress, { stiffness: 260, damping: 32, restDelta: 0.001 })

  return (
    <motion.div
      style={{ scaleX: width }}
      className="fixed inset-x-0 top-0 z-50 h-px origin-right bg-accent-deep"
      aria-hidden="true"
    />
  )
}
