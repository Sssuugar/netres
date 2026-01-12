<template>
  <canvas ref="canvasRef" class="mouse-trail-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)

onMounted(() => {
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  let width, height
  let particles = []

  const resize = () => {
    width = canvas.width = window.innerWidth
    height = canvas.height = window.innerHeight
  }

  window.addEventListener('resize', resize)
  resize()

  const createParticle = (x, y) => {
    const hue = (Date.now() / 10) % 360
    particles.push({
      x, y,
      size: Math.random() * 3 + 1,
      color: `hsla(${hue}, 70%, 60%, 0.8)`,
      vx: (Math.random() - 0.5) * 1,
      vy: (Math.random() - 0.5) * 1,
      life: 1
    })
  }

  window.addEventListener('mousemove', (e) => {
    for(let i=0; i<3; i++) {
      createParticle(e.clientX, e.clientY)
    }
  })

  const animate = () => {
    ctx.clearRect(0, 0, width, height)

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      p.x += p.vx
      p.y += p.vy
      p.life -= 0.02
      p.size *= 0.95

      if (p.life <= 0) {
        particles.splice(i, 1)
        i--
        continue
      }

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = p.color
      ctx.fill()
    }

    requestAnimationFrame(animate)
  }

  animate()

  onUnmounted(() => {
    window.removeEventListener('resize', resize)
  })
})
</script>

<style scoped>
.mouse-trail-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
}
</style>