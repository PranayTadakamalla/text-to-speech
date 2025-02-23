"use client"

import { useState, useEffect, useRef } from "react"
import * as THREE from "three"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const TextToSpeech = () => {
  const [text, setText] = useState("")
  const [language, setLanguage] = useState("")
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState("")
  const [languages, setLanguages] = useState([])
  const containerRef = useRef(null)
  const brainRef = useRef(null)
  const neuronsRef = useRef(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [warning, setWarning] = useState("")

  useEffect(() => {
    const synth = window.speechSynthesis
    const getVoices = () => {
      const availableVoices = synth.getVoices()
      setVoices(availableVoices)
      const uniqueLanguages = [...new Set(availableVoices.map((voice) => voice.lang))]
      setLanguages(uniqueLanguages)
    }
    getVoices()
    synth.onvoiceschanged = getVoices
  }, [])

  useEffect(() => {
    if (!containerRef.current || !isSpeaking) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    containerRef.current.appendChild(renderer.domElement)

    // Brain
    const brainGeometry = new THREE.IcosahedronGeometry(2, 5)
    const brainMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      wireframe: true,
      emissive: 0x00ffff,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8,
    })
    const brain = new THREE.Mesh(brainGeometry, brainMaterial)
    scene.add(brain)
    brainRef.current = brain

    // Neurons
    const neuronsGroup = new THREE.Group()
    for (let i = 0; i < 200; i++) {
      const neuronGeometry = new THREE.SphereGeometry(0.05, 8, 8)
      const neuronMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff })
      const neuron = new THREE.Mesh(neuronGeometry, neuronMaterial)
      neuron.position.set((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5)
      neuronsGroup.add(neuron)
    }
    scene.add(neuronsGroup)
    neuronsRef.current = neuronsGroup

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0x00ffff, 2, 100)
    pointLight.position.set(5, 5, 5)
    scene.add(pointLight)

    camera.position.z = 6

    const animate = () => {
      requestAnimationFrame(animate)
      const time = Date.now() * 0.001
      const scaleFactor = 1 + Math.sin(time * 2) * 0.1
      brain.scale.set(scaleFactor, scaleFactor, scaleFactor)
      brain.rotation.x += 0.005
      brain.rotation.y += 0.005

      neuronsGroup.children.forEach((neuron, index) => {
        neuron.position.x += Math.sin(time + index) * 0.01
        neuron.position.y += Math.cos(time + index) * 0.01
        neuron.position.z += Math.sin(time * 0.5 + index) * 0.01
      })

      pointLight.intensity = 2 + Math.sin(time * 4) * 0.5
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      if (containerRef.current && containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild)
      }
    }
  }, [isSpeaking])

  const speak = () => {
    if (!text.trim() || !language || !selectedVoice) {
      setWarning("Please enter text and select both language and voice.")
      return
    }
    const speech = new SpeechSynthesisUtterance(text)
    speech.lang = language
    speech.voice = voices.find((v) => v.name === selectedVoice)
    setIsSpeaking(true)
    speech.onend = () => setIsSpeaking(false)
    window.speechSynthesis.speak(speech)
    setWarning("")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white font-sans p-4 relative overflow-hidden">
      {isSpeaking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          ref={containerRef}
          className="absolute inset-0"
        />
      )}
      <AnimatePresence>
        {!isSpeaking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="w-[500px] p-6 bg-gray-900 bg-opacity-90 shadow-2xl rounded-xl backdrop-blur-lg mx-4">
              <CardContent className="space-y-4">
                <Textarea
                  className="w-full h-36 p-3 text-lg rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-cyan-400 resize-none"
                  placeholder="Enter text here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                {/* Language Selection */}
                <Select value={language} onValueChange={(value) => setLanguage(value)}>
                  <SelectTrigger className="w-full bg-gray-800 text-white p-3 text-lg">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 text-white shadow-lg rounded-lg">
                    {languages.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Voice Selection */}
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger className="w-full bg-gray-800 text-white p-3 text-lg">
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 text-white shadow-lg rounded-lg">
                    {voices.map((voice) => (
                      <SelectItem key={voice.name} value={voice.name}>
                        {voice.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {warning && <div className="text-red-500 text-center text-lg">{warning}</div>}

                {/* Speak Button */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    className="w-full bg-cyan-500 text-white py-3 text-lg rounded-lg shadow-lg hover:bg-cyan-400"
                    onClick={speak}
                    disabled={!text.trim() || !language || !selectedVoice}
                  >
                    Speak
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TextToSpeech
