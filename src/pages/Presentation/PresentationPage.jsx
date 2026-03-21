import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useEditor } from '../../context/EditorContext'

const SLIDE_WIDTH = 1280
const SLIDE_HEIGHT = 720
const PREVIEW_SCALE = 0.175
const PREVIEW_ENTER_X = 230
const PREVIEW_ENTER_Y = 88

const PresentationPage = () => {
  const navigate = useNavigate()
  const { templateId } = useParams()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [transitioning, setTransitioning] = useState(false)
  const [transitionDirection, setTransitionDirection] = useState('next')
  const [slideKey, setSlideKey] = useState(0)
  const [showPreviews, setShowPreviews] = useState(true)

  // Animation states - slide rises from below, current shrinks to preview
  const [animationPhase, setAnimationPhase] = useState('idle') // 'idle', 'sliding'
  const [previousSlide, setPreviousSlide] = useState(null)

  // Refs
  const controlsTimeoutRef = useRef(null)
  const slideContainerRef = useRef(null)
  const stageRef = useRef(null)
  const [stageScale, setStageScale] = useState(1)

  // Get frames and elements from editor context
  const { frames, projectTitle, getFrameElements } = useEditor()

  // Sidebar state (view-only, no drag-drop in presentation mode)
  const [showSidebar, setShowSidebar] = useState(false)

  // Convert frames to slides format
  const slides = frames.map((frame) => {
    const frameElements = getFrameElements ? getFrameElements(frame.id) : []
    return {
      id: frame.id,
      title: frame.title || `Slide ${frame.id}`,
      backgroundColor: frame.backgroundColor || '#ffffff',
      elements: frameElements,
      notes: frame.notes || '',
      transition: frame.transition || 'fade',
    }
  })

  // Animation class mapping
  const getAnimationClass = (animation) => {
    if (!animation || animation === 'none') return ''

    const animMap = {
      'fadeIn': 'anim-fadeIn',
      'fadeOut': 'anim-fadeOut',
      'slideInLeft': 'anim-slideInLeft',
      'slideInRight': 'anim-slideInRight',
      'slideInUp': 'anim-slideInUp',
      'slideInDown': 'anim-slideInDown',
      'zoomIn': 'anim-zoomIn',
      'zoomOut': 'anim-zoomOut',
      'bounceIn': 'anim-bounceIn',
      'rotateIn': 'anim-rotateIn',
      'flipInX': 'anim-flipInX',
      'flipInY': 'anim-flipInY',
      'lightSpeedIn': 'anim-lightSpeedIn',
      'rollIn': 'anim-rollIn',
      'slideOutLeft': 'anim-slideOutLeft',
      'slideOutRight': 'anim-slideOutRight',
      'pulse': 'anim-pulse',
      'shake': 'anim-shake',
      'swing': 'anim-swing',
      'tada': 'anim-tada',
      'wobble': 'anim-wobble',
      'heartBeat': 'anim-heartBeat',
      'rubberBand': 'anim-rubberBand',
    }

    return animMap[animation] || ''
  }

  // Handle slide transitions - preview rises to center, current shrinks to preview
  const goToSlide = useCallback((index, direction = 'next') => {
    if (index < 0 || index >= slides.length || transitioning) return

    setTransitionDirection(direction)
    setTransitioning(true)
    setPreviousSlide(currentSlide)

    // Start animation - next slide rises from preview, current shrinks to preview
    setAnimationPhase('sliding')
    setCurrentSlide(index)
    setSlideKey(prev => prev + 1)

    // Animation complete after 550ms
    setTimeout(() => {
      setAnimationPhase('idle')
      setTransitioning(false)
    }, 550)
  }, [currentSlide, slides.length, transitioning])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case ' ':
      case 'PageDown':
        e.preventDefault()
        goToSlide(currentSlide + 1, 'next')
        break

      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
      case 'Backspace':
        e.preventDefault()
        goToSlide(currentSlide - 1, 'prev')
        break

      case 'Home':
        e.preventDefault()
        goToSlide(0, 'prev')
        break
      case 'End':
        e.preventDefault()
        goToSlide(slides.length - 1, 'next')
        break

      case 'f':
      case 'F':
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault()
          toggleFullscreen()
        }
        break

      case 'Escape':
        handleExit()
        break

      case 'p':
      case 'P':
        // Toggle slide previews
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault()
          setShowPreviews(prev => !prev)
        }
        break

      case 's':
      case 'S':
        // Toggle sidebar
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault()
          setShowSidebar(prev => !prev)
        }
        break

      default:
        break
    }
  }, [currentSlide, slides.length, goToSlide])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [])

  // Mouse move for controls visibility
  const handleMouseMove = useCallback(() => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 3000)
  }, [])

  // Scale slide to fit viewport while preserving 1280x720 layout
  // Using 0.85 factor to make slide smaller and leave more padding around it
  useEffect(() => {
    const updateScale = () => {
      if (!stageRef.current) return
      const { width, height } = stageRef.current.getBoundingClientRect()
      const scale = Math.min(width / SLIDE_WIDTH, height / SLIDE_HEIGHT) * 0.9
      setStageScale(scale > 0 ? scale : 1)
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  // Enter fullscreen on mount
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      } catch (err) {
        console.log('Fullscreen not supported or denied')
      }
    }
    enterFullscreen()

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (err) {
      console.log('Fullscreen toggle failed')
    }
  }

  const handleExit = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    }
    navigate(`/editor/${templateId || 'new'}`, { replace: true })
  }

  // Render element based on type with animation support
  const renderElement = (element, index) => {
    const animClass = getAnimationClass(element.animation)
    const animStyle = element.animation && element.animation !== 'none' ? {
      '--anim-duration': `${element.animationSpeed || 500}ms`,
      '--anim-delay': `${(element.animationDelay || 0) + (index * 100)}ms`, // Stagger animations
    } : {}

    const baseStyle = {
      position: 'absolute',
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      ...animStyle,
    }

    switch (element.type) {
      case 'text':
        return (
          <div
            key={`${element.id}-${slideKey}`}
            className={animClass}
            style={{
              ...baseStyle,
              fontSize: element.fontSize,
              fontWeight: element.fontWeight,
              fontFamily: element.fontFamily || 'Inter',
              fontStyle: element.fontStyle || 'normal',
              textDecoration: element.textDecoration || 'none',
              textAlign: element.textAlign || 'center',
              color: element.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: element.textAlign === 'left' ? 'flex-start' : element.textAlign === 'right' ? 'flex-end' : 'center',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.5,
              padding: '8px',
            }}
          >
            {element.content}
          </div>
        )

      case 'shape':
        const shapeOpacity = (element.opacity || 100) / 100
        if (element.shapeType === 'circle') {
          return (
            <div
              key={`${element.id}-${slideKey}`}
              className={animClass}
              style={{
                ...baseStyle,
                backgroundColor: element.fill,
                borderRadius: '50%',
                opacity: shapeOpacity,
                border: element.strokeWidth ? `${element.strokeWidth}px solid ${element.strokeColor}` : 'none',
                transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
              }}
            />
          )
        }
        if (element.shapeType === 'triangle') {
          return (
            <svg
              key={`${element.id}-${slideKey}`}
              className={animClass}
              style={{...baseStyle, opacity: shapeOpacity}}
              viewBox="0 0 200 150"
              preserveAspectRatio="none"
            >
              <polygon points="100,0 0,150 200,150" fill={element.fill} stroke={element.strokeColor} strokeWidth={element.strokeWidth || 0} />
            </svg>
          )
        }
        if (element.shapeType === 'star') {
          return (
            <svg
              key={`${element.id}-${slideKey}`}
              className={animClass}
              style={{...baseStyle, opacity: shapeOpacity}}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill={element.fill} stroke={element.strokeColor} strokeWidth={element.strokeWidth || 0} />
            </svg>
          )
        }
        if (element.shapeType === 'line') {
          return (
            <svg
              key={`${element.id}-${slideKey}`}
              className={animClass}
              style={{...baseStyle, opacity: shapeOpacity}}
              viewBox="0 0 200 10"
              preserveAspectRatio="none"
            >
              <line x1="0" y1="5" x2="200" y2="5" stroke={element.fill} strokeWidth={element.strokeWidth || 2} strokeLinecap="round" />
            </svg>
          )
        }
        if (element.shapeType === 'arrow') {
          return (
            <svg
              key={`${element.id}-${slideKey}`}
              className={animClass}
              style={{...baseStyle, opacity: shapeOpacity}}
              viewBox="0 0 200 30"
              preserveAspectRatio="none"
            >
              <line x1="0" y1="15" x2="170" y2="15" stroke={element.fill} strokeWidth={element.strokeWidth || 2} strokeLinecap="round" />
              <polygon points="170,5 200,15 170,25" fill={element.fill} />
            </svg>
          )
        }
        if (element.shapeType === 'hexagon') {
          return (
            <svg
              key={`${element.id}-${slideKey}`}
              className={animClass}
              style={{...baseStyle, opacity: shapeOpacity}}
              viewBox="0 0 120 100"
              preserveAspectRatio="none"
            >
              <polygon points="30,0 90,0 120,50 90,100 30,100 0,50" fill={element.fill} stroke={element.strokeColor} strokeWidth={element.strokeWidth || 0} />
            </svg>
          )
        }
        if (element.shapeType === 'diamond') {
          return (
            <svg
              key={`${element.id}-${slideKey}`}
              className={animClass}
              style={{...baseStyle, opacity: shapeOpacity}}
              viewBox="0 0 100 140"
              preserveAspectRatio="none"
            >
              <polygon points="50,0 100,70 50,140 0,70" fill={element.fill} stroke={element.strokeColor} strokeWidth={element.strokeWidth || 0} />
            </svg>
          )
        }
        return (
          <div
            key={`${element.id}-${slideKey}`}
            className={animClass}
            style={{
              ...baseStyle,
              backgroundColor: element.fill,
              borderRadius: '4px',
              opacity: shapeOpacity,
              border: element.strokeWidth ? `${element.strokeWidth}px solid ${element.strokeColor}` : 'none',
              transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
            }}
          />
        )

      case 'image':
        return (
          <img
            key={`${element.id}-${slideKey}`}
            className={animClass}
            src={element.src || ''}
            alt="slide content"
            style={{
              ...baseStyle,
              objectFit: 'cover',
              borderRadius: '4px',
              display: element.src ? 'block' : 'none',
            }}
            onError={(e) => { e.target.style.display = 'none' }}
          />
        )

      case 'icon':
        const iconSize = Math.min(element.width, element.height) * 0.8
        const iconColor = element.color || '#2E7D32'
        return (
          <div
            key={`${element.id}-${slideKey}`}
            className={animClass}
            style={{
              ...baseStyle,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {element.iconType === 'star' && (
              <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill={iconColor} stroke="none">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            )}
            {element.iconType === 'heart' && (
              <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill={iconColor} stroke="none">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            )}
            {element.iconType === 'check' && (
              <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            {element.iconType === 'lightning' && (
              <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill={iconColor} stroke="none">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            )}
            {element.iconType === 'thumbsUp' && (
              <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill={iconColor} stroke="none">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
            )}
          </div>
        )

      case 'table':
        return (
          <div
            key={`${element.id}-${slideKey}`}
            className={animClass}
            style={baseStyle}
          >
            <table
              style={{
                width: '100%',
                height: '100%',
                borderCollapse: 'collapse',
              }}
            >
              <tbody>
                {Array(element.rows).fill(null).map((_, rowIdx) => (
                  <tr key={rowIdx}>
                    {Array(element.cols).fill(null).map((_, colIdx) => (
                      <td
                        key={`${rowIdx}-${colIdx}`}
                        style={{
                          border: '1px solid #9ca3af',
                          padding: '8px',
                          fontSize: '14px',
                          textAlign: 'center',
                        }}
                      >
                        {element.data?.[rowIdx]?.[colIdx] || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )

      case 'video':
        const isYouTube = element.src?.includes('youtube.com') || element.src?.includes('youtu.be')
        if (!element.src) return null
        return (
          <div
            key={`${element.id}-${slideKey}`}
            className={animClass}
            style={{...baseStyle, overflow: 'hidden', borderRadius: '8px'}}
          >
            {isYouTube ? (
              <iframe
                width="100%"
                height="100%"
                src={element.src}
                style={{ border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={element.src}
                controls
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
          </div>
        )

      case 'audio':
        if (!element.src) return null
        return (
          <div
            key={`${element.id}-${slideKey}`}
            className={`${animClass} bg-gray-100 rounded-lg p-4 flex items-center gap-3`}
            style={baseStyle}
          >
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </div>
            <audio controls src={element.src} style={{ flex: 1 }} />
          </div>
        )

      default:
        return null
    }
  }

  const currentSlideData = slides[currentSlide] || { elements: [] }
  const prevSlideData = currentSlide > 0 ? slides[currentSlide - 1] : null
  const nextSlideData = currentSlide < slides.length - 1 ? slides[currentSlide + 1] : null

  return (
    <div
      className="h-screen bg-gray-900 flex flex-col select-none overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Slide Transition Animation Styles */}
      <style>{`
        /* Current slide fades out smoothly */
        @keyframes slideExitFade {
          0% {
            transform: scale(var(--stage-scale, 0.85));
            opacity: 1;
          }
          100% {
            transform: scale(var(--stage-scale, 0.85));
            opacity: 0;
          }
        }

        /* Next slide - preview expanding to center (matches preview position exactly) */
        @keyframes slideEnterFromRight {
          0% {
            transform: scale(${PREVIEW_SCALE}) translateX(${PREVIEW_ENTER_X}%) translateY(${PREVIEW_ENTER_Y}%);
            opacity: 1;
          }
          100% {
            transform: scale(var(--stage-scale, 0.85)) translateX(0) translateY(0);
            opacity: 1;
          }
        }

        /* Going back: slide fades out */
        @keyframes slideExitFadeRight {
          0% {
            transform: scale(var(--stage-scale, 0.85));
            opacity: 1;
          }
          100% {
            transform: scale(var(--stage-scale, 0.85));
            opacity: 0;
          }
        }

        /* Previous slide - preview expanding from bottom-left */
        @keyframes slideEnterFromLeft {
          0% {
            transform: scale(${PREVIEW_SCALE}) translateX(-${PREVIEW_ENTER_X}%) translateY(${PREVIEW_ENTER_Y}%);
            opacity: 1;
          }
          100% {
            transform: scale(var(--stage-scale, 0.85)) translateX(0) translateY(0);
            opacity: 1;
          }
        }

        .slide-rise-from-preview {
          animation: slideEnterFromRight 0.55s cubic-bezier(0.4, 0, 0.15, 1) forwards;
        }

        .slide-shrink-to-preview {
          animation: slideExitFade 0.35s ease-out forwards;
        }

        .slide-rise-from-left {
          animation: slideEnterFromLeft 0.55s cubic-bezier(0.4, 0, 0.15, 1) forwards;
        }

        .slide-shrink-to-right {
          animation: slideExitFadeRight 0.35s ease-out forwards;
        }

        /* Hide preview during animation */
        .preview-hidden {
          opacity: 0 !important;
          pointer-events: none !important;
          transition: opacity 0.05s ease-out;
        }

        /* Preview boxes - always visible by default */
        .preview-box {
          opacity: 1;
          transform: scale(1);
          transition: opacity 0.1s ease-out, transform 0.3s ease;
          pointer-events: auto;
        }

        .preview-box:hover {
          transform: scale(1.05) !important;
          box-shadow: 0 8px 30px rgba(0,0,0,0.5);
        }

        .presentation-stage {
          perspective: 1500px;
          perspective-origin: center center;
        }

        .main-slide {
          transform-style: preserve-3d;
          will-change: transform, opacity;
          backface-visibility: hidden;
        }

        .slide-shadow {
          box-shadow:
            0 25px 60px -15px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(255, 255, 255, 0.08) inset;
        }

        /* Sidebar Styles */
        .sidebar-slide {
          transition: all 0.2s ease-out;
        }

        .sidebar-slide:hover {
          transform: scale(1.02);
        }
      `}</style>

      {/* Main Presentation Stage */}
      <div ref={stageRef} className="flex-1 flex items-center justify-center p-4 overflow-hidden presentation-stage relative">
        {/* Background gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center,
              rgba(30, 41, 59, 0.9) 0%,
              rgba(15, 23, 42, 1) 70%
            )`,
          }}
        />

        {/* Exiting slide - shrinks to bottom-left (next) or bottom-right (prev) */}
        {animationPhase === 'sliding' && previousSlide !== null && (
          <div
            className={`absolute main-slide slide-shadow ${
              transitionDirection === 'next' ? 'slide-shrink-to-preview' : 'slide-shrink-to-right'
            }`}
            style={{
              '--stage-scale': stageScale,
              width: `${SLIDE_WIDTH}px`,
              height: `${SLIDE_HEIGHT}px`,
              backgroundColor: slides[previousSlide]?.backgroundColor || '#ffffff',
              borderRadius: '12px',
              zIndex: 5,
            }}
          >
            <div className="absolute inset-0 rounded-xl overflow-hidden">
              {slides[previousSlide]?.elements?.map((element, index) => renderElement(element, index))}
            </div>
          </div>
        )}

        {/* Current Slide - rises from bottom-right (next) or bottom-left (prev) */}
        <div
          ref={slideContainerRef}
          key={slideKey}
          className={`relative main-slide slide-shadow ${
            animationPhase === 'sliding'
              ? transitionDirection === 'next'
                ? 'slide-rise-from-preview'
                : 'slide-rise-from-left'
              : ''
          }`}
          style={{
            width: `${SLIDE_WIDTH}px`,
            height: `${SLIDE_HEIGHT}px`,
            '--stage-scale': stageScale,
            transform: animationPhase === 'idle' ? `scale(${stageScale})` : undefined,
            transformOrigin: 'center center',
            backgroundColor: currentSlideData.backgroundColor || '#ffffff',
            borderRadius: '12px',
            zIndex: animationPhase === 'sliding' ? 10 : 1,
            transition: animationPhase === 'idle' ? 'transform 0.3s ease-out' : undefined,
          }}
        >
          {/* Slide Elements */}
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            {currentSlideData.elements?.map((element, index) => renderElement(element, index))}
          </div>

          {/* Default content if no elements */}
          {(!currentSlideData.elements || currentSlideData.elements.length === 0) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-6xl font-black text-gray-900 mb-4 whitespace-pre-line">
                  {currentSlideData.title || 'Untitled Slide'}
                </h1>
                <p className="text-xl text-gray-500">No content on this slide</p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom-Left Preview Box - shows PREVIOUS slide */}
        {currentSlide > 0 && showPreviews && !showSidebar && (
          <div
            className={`preview-box absolute bottom-20 left-4 rounded-xl overflow-hidden cursor-pointer z-20 ${
              animationPhase === 'sliding' && transitionDirection === 'prev' ? 'preview-hidden' : ''
            }`}
            onClick={() => goToSlide(currentSlide - 1, 'prev')}
              style={{
                width: '224px',
                height: '126px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              }}
          >
            {/* Preview label */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent px-2 py-1 z-10">
              <span className="text-white/90 text-xs font-medium">Previous</span>
            </div>

            {/* Slide number badge */}
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs font-bold px-2 py-0.5 rounded z-10">
              {currentSlide}
            </div>

            {/* Scaled slide content */}
            <div
              style={{
                width: `${SLIDE_WIDTH}px`,
                height: `${SLIDE_HEIGHT}px`,
                transform: `scale(${PREVIEW_SCALE})`,
                transformOrigin: 'top left',
                backgroundColor: prevSlideData?.backgroundColor || '#ffffff',
              }}
            >
              {prevSlideData?.elements?.map((element) => {
                const baseStyle = {
                  position: 'absolute',
                  left: element.x,
                  top: element.y,
                  width: element.width,
                  height: element.height,
                }

                switch (element.type) {
                  case 'text':
                    const getJustify = (align) => {
                      if (align === 'left') return 'flex-start'
                      if (align === 'right') return 'flex-end'
                      return 'center'
                    }
                    return (
                      <div
                        key={element.id}
                        style={{
                          ...baseStyle,
                          fontSize: element.fontSize,
                          fontWeight: element.fontWeight,
                          fontFamily: element.fontFamily || 'Inter',
                          fontStyle: element.fontStyle || 'normal',
                          textDecoration: element.textDecoration || 'none',
                          color: element.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: getJustify(element.textAlign),
                          textAlign: element.textAlign || 'center',
                          overflow: 'hidden',
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.4,
                          padding: '4px',
                        }}
                      >
                        {element.content}
                      </div>
                    )
                  case 'shape':
                    if (element.shapeType === 'circle') {
                      return <div key={element.id} style={{ ...baseStyle, backgroundColor: element.fill, borderRadius: '50%' }} />
                    }
                    return <div key={element.id} style={{ ...baseStyle, backgroundColor: element.fill, borderRadius: '4px' }} />
                  case 'image':
                    return <img key={element.id} src={element.src} alt="" style={{ ...baseStyle, objectFit: 'cover' }} />
                  default:
                    return null
                }
              })}

              {(!prevSlideData?.elements || prevSlideData.elements.length === 0) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-semibold text-gray-400">{prevSlideData?.title}</span>
                </div>
              )}
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-blue-500/0 hover:bg-blue-500/10 transition-colors" />
          </div>
        )}

        {/* Bottom-Right Preview Box - shows NEXT slide */}
        {currentSlide < slides.length - 1 && showPreviews && !showSidebar && (
          <div
            className={`preview-box absolute bottom-20 right-4 rounded-xl overflow-hidden cursor-pointer z-20 ${
              animationPhase === 'sliding' && transitionDirection === 'next' ? 'preview-hidden' : ''
            }`}
            onClick={() => goToSlide(currentSlide + 1, 'next')}
              style={{
                width: '224px',
                height: '126px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              }}
          >
            {/* Preview label */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent px-2 py-1 z-10">
              <span className="text-white/90 text-xs font-medium">Next</span>
            </div>

            {/* Slide number badge */}
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-0.5 rounded z-10">
              {currentSlide + 2}
            </div>

            {/* Scaled slide content */}
            <div
              style={{
                width: `${SLIDE_WIDTH}px`,
                height: `${SLIDE_HEIGHT}px`,
                transform: `scale(${PREVIEW_SCALE})`,
                transformOrigin: 'top left',
                backgroundColor: nextSlideData?.backgroundColor || '#ffffff',
              }}
            >
              {nextSlideData?.elements?.map((element) => {
                const baseStyle = {
                  position: 'absolute',
                  left: element.x,
                  top: element.y,
                  width: element.width,
                  height: element.height,
                }

                switch (element.type) {
                  case 'text':
                    const getJustify = (align) => {
                      if (align === 'left') return 'flex-start'
                      if (align === 'right') return 'flex-end'
                      return 'center'
                    }
                    return (
                      <div
                        key={element.id}
                        style={{
                          ...baseStyle,
                          fontSize: element.fontSize,
                          fontWeight: element.fontWeight,
                          fontFamily: element.fontFamily || 'Inter',
                          fontStyle: element.fontStyle || 'normal',
                          textDecoration: element.textDecoration || 'none',
                          color: element.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: getJustify(element.textAlign),
                          textAlign: element.textAlign || 'center',
                          overflow: 'hidden',
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.4,
                          padding: '4px',
                        }}
                      >
                        {element.content}
                      </div>
                    )
                  case 'shape':
                    if (element.shapeType === 'circle') {
                      return <div key={element.id} style={{ ...baseStyle, backgroundColor: element.fill, borderRadius: '50%' }} />
                    }
                    return <div key={element.id} style={{ ...baseStyle, backgroundColor: element.fill, borderRadius: '4px' }} />
                  case 'image':
                    return <img key={element.id} src={element.src} alt="" style={{ ...baseStyle, objectFit: 'cover' }} />
                  default:
                    return null
                }
              })}

              {(!nextSlideData?.elements || nextSlideData.elements.length === 0) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-semibold text-gray-400">{nextSlideData?.title}</span>
                </div>
              )}
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-blue-500/0 hover:bg-blue-500/10 transition-colors" />
          </div>
        )}
      </div>

      {/* Slides Sidebar (View Only) */}
      <div
        className={`absolute left-0 top-0 bottom-14 w-48 bg-gray-800/95 backdrop-blur-sm border-r border-gray-700 transition-transform duration-300 z-20 ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-12 flex items-center justify-between px-3 border-b border-gray-700">
          <span className="text-white/80 text-sm font-medium">Slides</span>
          <button
            onClick={() => setShowSidebar(false)}
            className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Slides List */}
        <div className="overflow-y-auto h-[calc(100%-48px)] p-2 space-y-2">
          {slides.map((slide, index) => {
            const isCurrentSlide = index === currentSlide

            return (
              <div
                key={slide.id}
                onClick={() => goToSlide(index, index > currentSlide ? 'next' : 'prev')}
                className={`sidebar-slide relative rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  isCurrentSlide
                    ? 'border-blue-500 ring-2 ring-blue-500/30'
                    : 'border-transparent hover:border-white/30'
                }`}
              >
                {/* Slide Thumbnail */}
                <div
                  className="relative bg-white"
                  style={{
                    width: '100%',
                    aspectRatio: '16/9',
                  }}
                >
                  {/* Scaled content */}
                  <div
                    style={{
                      width: `${SLIDE_WIDTH}px`,
                      height: `${SLIDE_HEIGHT}px`,
                      transform: 'scale(0.15)',
                      transformOrigin: 'top left',
                      backgroundColor: slide.backgroundColor || '#ffffff',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                    }}
                  >
                    {slide.elements?.map((element) => {
                      const baseStyle = {
                        position: 'absolute',
                        left: element.x,
                        top: element.y,
                        width: element.width,
                        height: element.height,
                      }

                      switch (element.type) {
                        case 'text':
                          // Match justifyContent with textAlign
                          const getJustify = (align) => {
                            if (align === 'left') return 'flex-start'
                            if (align === 'right') return 'flex-end'
                            return 'center'
                          }
                          return (
                            <div
                              key={element.id}
                              style={{
                                ...baseStyle,
                                fontSize: element.fontSize,
                                fontWeight: element.fontWeight,
                                fontFamily: element.fontFamily || 'Inter',
                                fontStyle: element.fontStyle || 'normal',
                                textDecoration: element.textDecoration || 'none',
                                color: element.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: getJustify(element.textAlign),
                                textAlign: element.textAlign || 'center',
                                overflow: 'hidden',
                                whiteSpace: 'pre-wrap',
                                lineHeight: 1.4,
                                padding: '4px',
                              }}
                            >
                              {element.content}
                            </div>
                          )
                        case 'shape':
                          if (element.shapeType === 'circle') {
                            return <div key={element.id} style={{ ...baseStyle, backgroundColor: element.fill, borderRadius: '50%' }} />
                          }
                          return <div key={element.id} style={{ ...baseStyle, backgroundColor: element.fill, borderRadius: '4px' }} />
                        case 'image':
                          return <img key={element.id} src={element.src} alt="" style={{ ...baseStyle, objectFit: 'cover' }} />
                        default:
                          return null
                      }
                    })}

                    {(!slide.elements || slide.elements.length === 0) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-semibold text-gray-400">{slide.title}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Slide Number Badge */}
                <div
                  className={`absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-xs font-bold ${
                    isCurrentSlide ? 'bg-blue-500 text-white' : 'bg-black/60 text-white'
                  }`}
                >
                  {index + 1}
                </div>

                {/* Current slide indicator */}
                {isCurrentSlide && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                )}
              </div>
            )
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gray-800/90 border-t border-gray-700 flex items-center justify-center">
          <span className="text-white/50 text-xs">Click to navigate</span>
        </div>
      </div>

      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setShowSidebar(prev => !prev)}
        className={`absolute left-2 top-1/2 -translate-y-1/2 w-8 h-16 rounded-r-lg bg-gray-800/90 hover:bg-gray-700 flex items-center justify-center text-white/70 hover:text-white transition-all z-10 ${
          showSidebar ? 'opacity-0 pointer-events-none' : 'opacity-100'
        } ${showControls ? '' : 'opacity-0'}`}
        title="Show Slides (S)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Bottom Bar - shown/hidden based on mouse movement */}
      <div
        className={`h-14 bg-gray-800 flex items-center justify-between px-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Left - Title & Back Navigation */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => goToSlide(currentSlide - 1, 'prev')}
            disabled={currentSlide === 0}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white disabled:opacity-30 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
            title="Previous Slide"
            aria-label="Previous Slide"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="text-white font-medium truncate max-w-[200px]">
            {projectTitle || 'Untitled Project'}
          </span>
        </div>

        {/* Center - Slide counter & dots */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index, index > currentSlide ? 'next' : 'prev')}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide ? 'bg-white w-4' : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
          <span className="text-white text-sm">
            {currentSlide + 1} / {slides.length}
          </span>
          <button
            onClick={() => goToSlide(currentSlide + 1, 'next')}
            disabled={currentSlide === slides.length - 1}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white disabled:opacity-30 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
            title="Next Slide"
            aria-label="Next Slide"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Right - Controls */}
        <div className="flex items-center gap-2">
          {/* Toggle Sidebar */}
          <button
            onClick={() => setShowSidebar(prev => !prev)}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-all focus:outline-none focus:ring-2 focus:ring-white/50 ${showSidebar ? 'bg-white/20' : 'hover:bg-white/10'}`}
            title="Toggle Slides Sidebar (S)"
            aria-label="Toggle Slides Sidebar"
            aria-pressed={showSidebar}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="18" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </button>

          {/* Toggle Previews */}
          <button
            onClick={() => setShowPreviews(prev => !prev)}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-all focus:outline-none focus:ring-2 focus:ring-white/50 ${showPreviews ? 'bg-white/20' : 'hover:bg-white/10'}`}
            title="Toggle Previews (P)"
            aria-label="Toggle Preview Boxes"
            aria-pressed={showPreviews}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
            title="Fullscreen (F)"
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="4 14 10 14 10 20" />
                <polyline points="20 10 14 10 14 4" />
                <line x1="14" y1="10" x2="21" y2="3" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 3 21 3 21 9" />
                <polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            )}
          </button>

          {/* Exit */}
          <button
            onClick={handleExit}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
            title="Exit (Esc)"
            aria-label="Exit Presentation"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Navigation hint */}
      <div className={`absolute bottom-16 left-1/2 -translate-x-1/2 text-white/40 text-xs transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        ← → Navigate • S Slides • P Previews • F Fullscreen • Esc Exit
      </div>
    </div>
  )
}

export default PresentationPage
