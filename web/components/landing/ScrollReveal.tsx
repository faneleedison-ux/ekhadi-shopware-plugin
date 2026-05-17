'use client'

import { motion } from 'framer-motion'
import { Children, ReactNode } from 'react'

const itemVariants = {
  hidden:  { opacity: 0, y: 36, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1    },
}

interface Props {
  children: ReactNode
  delay?: number
  className?: string
  stagger?: boolean
  staggerDelay?: number
}

export default function ScrollReveal({
  children,
  delay = 0,
  className = '',
  stagger = false,
  staggerDelay = 90,
}: Props) {
  if (stagger) {
    return (
      <motion.div
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0 }}
        variants={{ visible: { transition: { staggerChildren: staggerDelay / 1000 } } }}
      >
        {Children.map(children, (child) => (
          <motion.div
            variants={itemVariants}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            {child}
          </motion.div>
        ))}
      </motion.div>
    )
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0 }}
      variants={itemVariants}
      transition={{ duration: 0.7, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}