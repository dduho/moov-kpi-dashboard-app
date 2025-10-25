<script>
import { defineComponent, h } from 'vue'

// Icon components as functional components
export const IconDashboard = defineComponent({
  name: 'IconDashboard',
  props: {
    class: String,
    size: { type: Number, default: 24 }
  },
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: this.size,
      height: this.size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      class: this.class
    }, [
      h('rect', { x: '3', y: '3', width: '7', height: '7', rx: '1' }),
      h('rect', { x: '14', y: '3', width: '7', height: '7', rx: '1' }),
      h('rect', { x: '14', y: '14', width: '7', height: '7', rx: '1' }),
      h('rect', { x: '3', y: '14', width: '7', height: '7', rx: '1' })
    ])
  }
})

export const IconLeaderboard = defineComponent({
  name: 'IconLeaderboard',
  props: {
    class: String,
    size: { type: Number, default: 24 }
  },
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: this.size,
      height: this.size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      class: this.class
    }, [
      h('path', { d: 'M3 3v18h18' }),
      h('path', { d: 'M18 17V9' }),
      h('path', { d: 'M13 17V5' }),
      h('path', { d: 'M8 17v-3' })
    ])
  }
})

export const IconOrders = defineComponent({
  name: 'IconOrders',
  props: {
    class: String,
    size: { type: Number, default: 24 }
  },
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: this.size,
      height: this.size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      class: this.class
    }, [
      h('circle', { cx: '8', cy: '21', r: '1' }),
      h('circle', { cx: '19', cy: '21', r: '1' }),
      h('path', { d: 'M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12' })
    ])
  }
})

export const IconProducts = defineComponent({
  name: 'IconProducts',
  props: {
    class: String,
    size: { type: Number, default: 24 }
  },
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: this.size,
      height: this.size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      class: this.class
    }, [
      h('path', { d: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' }),
      h('polyline', { points: '3.27 6.96 12 12.01 20.73 6.96' }),
      h('line', { x1: '12', y1: '22.08', x2: '12', y2: '12' })
    ])
  }
})

export const IconSalesReport = defineComponent({
  name: 'IconSalesReport',
  props: {
    class: String,
    size: { type: Number, default: 24 }
  },
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: this.size,
      height: this.size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      class: this.class
    }, [
      h('line', { x1: '12', y1: '20', x2: '12', y2: '10' }),
      h('line', { x1: '18', y1: '20', x2: '18', y2: '4' }),
      h('line', { x1: '6', y1: '20', x2: '6', y2: '16' })
    ])
  }
})

export const IconMessages = defineComponent({
  name: 'IconMessages',
  props: {
    class: String,
    size: { type: Number, default: 24 }
  },
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: this.size,
      height: this.size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      class: this.class
    }, [
      h('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' })
    ])
  }
})

export const IconSettings = defineComponent({
  name: 'IconSettings',
  props: {
    class: String,
    size: { type: Number, default: 24 }
  },
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: this.size,
      height: this.size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      class: this.class
    }, [
      h('circle', { cx: '12', cy: '12', r: '3' }),
      h('path', { d: 'M12 1v6m0 6v6m9-9h-6m-6 0H3m15.364 6.364l-4.243-4.243m-6.364 0l-4.243 4.243m12.728 0l-4.243-4.243m-6.364 0L3.636 18.364' })
    ])
  }
})

export const IconLogout = defineComponent({
  name: 'IconLogout',
  props: {
    class: String,
    size: { type: Number, default: 24 }
  },
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: this.size,
      height: this.size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      class: this.class
    }, [
      h('path', { d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' }),
      h('polyline', { points: '16 17 21 12 16 7' }),
      h('line', { x1: '21', y1: '12', x2: '9', y2: '12' })
    ])
  }
})

export const IconSearch = defineComponent({
  name: 'IconSearch',
  props: {
    class: String,
    size: { type: Number, default: 24 }
  },
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: this.size,
      height: this.size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      class: this.class
    }, [
      h('circle', { cx: '11', cy: '11', r: '8' }),
      h('path', { d: 'm21 21-4.35-4.35' })
    ])
  }
})

export const IconBell = defineComponent({
  name: 'IconBell',
  props: {
    class: String,
    size: { type: Number, default: 24 }
  },
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: this.size,
      height: this.size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      class: this.class
    }, [
      h('path', { d: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' }),
      h('path', { d: 'M13.73 21a2 2 0 0 1-3.46 0' })
    ])
  }
})

export const IconChevronDown = defineComponent({
  name: 'IconChevronDown',
  props: {
    class: String,
    size: { type: Number, default: 24 }
  },
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: this.size,
      height: this.size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      class: this.class
    }, [
      h('path', { d: 'M6 9l6 6 6-6' })
    ])
  }
})

export const IconDownload = defineComponent({
  name: 'IconDownload',
  props: {
    class: String,
    size: { type: Number, default: 24 }
  },
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: this.size,
      height: this.size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      class: this.class
    }, [
      h('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
      h('polyline', { points: '7 10 12 15 17 10' }),
      h('line', { x1: '12', y1: '15', x2: '12', y2: '3' })
    ])
  }
})

export const IconMenu = defineComponent({
  name: 'IconMenu',
  props: {
    class: String,
    size: { type: Number, default: 24 }
  },
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: this.size,
      height: this.size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      class: this.class
    }, [
      h('line', { x1: '3', y1: '12', x2: '21', y2: '12' }),
      h('line', { x1: '3', y1: '6', x2: '21', y2: '6' }),
      h('line', { x1: '3', y1: '18', x2: '21', y2: '18' })
    ])
  }
})

export const IconX = defineComponent({
  name: 'IconX',
  props: {
    class: String,
    size: { type: Number, default: 24 }
  },
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: this.size,
      height: this.size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      class: this.class
    }, [
      h('path', { d: 'M18 6 6 18' }),
      h('path', { d: 'm6 6 12 12' })
    ])
  }
})

export const IconUser = defineComponent({
  name: 'IconUser',
  props: {
    class: String,
    size: { type: Number, default: 24 }
  },
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: this.size,
      height: this.size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      class: this.class
    }, [
      h('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
      h('circle', { cx: '12', cy: '7', r: '4' })
    ])
  }
})

export const IconBadgeCheck = defineComponent({
  name: 'IconBadgeCheck',
  props: {
    class: String,
    size: { type: Number, default: 24 }
  },
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: this.size,
      height: this.size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      class: this.class
    }, [
      h('path', { d: 'M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z' }),
      h('path', { d: 'm9 12 2 2 4-4' })
    ])
  }
})
</script>

<template>
  <div style="display: none;"></div>
</template>
