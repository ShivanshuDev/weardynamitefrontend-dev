<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const props = defineProps({
  productColor: { type: String, default: '#ffffff' },
  modelUrl: { type: String, required: true },
  decals: { type: Array, default: () => [] }
})

const container = ref(null)
let scene, camera, renderer, controls, model

const init = () => {
  // Scene Setup
  scene = new THREE.Scene()
  scene.background = new THREE.Color('#f5f5f5')

  // Camera Setup
  const width = container.value.clientWidth
  const height = container.value.clientHeight
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
  camera.position.set(0, 0, 3)

  // Renderer Setup
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(width, height)
  renderer.domElement.style.width = '100%'
  renderer.domElement.style.height = '100%'
  container.value.appendChild(renderer.domElement)

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
  scene.add(ambientLight)
  const dirLight = new THREE.DirectionalLight(0xffffff, 1)
  dirLight.position.set(5, 5, 5)
  scene.add(dirLight)

  // Controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.minDistance = 2
  controls.maxDistance = 10

  // Load Model
  const loader = new GLTFLoader()
  loader.load(props.modelUrl, (gltf) => {
    model = gltf.scene
    
    // Center and scale model
    const box = new THREE.Box3().setFromObject(model)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 2 / maxDim
    model.scale.setScalar(scale)
    model.position.sub(center.multiplyScalar(scale))
    
    // Apply initial color
    applyColor(props.productColor)
    
    scene.add(model)
  }, 
  (xhr) => { console.log((xhr.loaded / xhr.total * 100) + '% loaded') },
  (error) => { console.error('An error happened', error) })

  window.addEventListener('resize', onWindowResize)
  animate()
}

const applyColor = (color) => {
  if (!model) return
  model.traverse((node) => {
    if (node.isMesh) {
      // Assuming the shirt mesh has a material we can change
      node.material.color.set(color)
    }
  })
}

const onWindowResize = () => {
  if (!container.value) return
  const width = container.value.clientWidth
  const height = container.value.clientHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

const animate = () => {
  requestAnimationFrame(animate)
  if (controls) controls.update()
  if (renderer && scene && camera) renderer.render(scene, camera)
}

onMounted(() => {
  init()
})

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize)
  if (renderer) renderer.dispose()
})

watch(() => props.productColor, (newColor) => {
  applyColor(newColor)
})
</script>

<template>
  <div ref="container" class="w-full h-full min-h-[300px] lg:min-h-[500px] cursor-grab active:cursor-grabbing">
    <!-- Three.js Canvas will be injected here -->
  </div>
</template>

<style scoped>
/* Tailwind handles the sizing */
</style>
