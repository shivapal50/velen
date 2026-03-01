import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userName, setUserName] = useState('')
  const [inputName, setInputName] = useState('')
  const [authError, setAuthError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMusicOn, setIsMusicOn] = useState(true)

  // Audio ref
  const audioRef = useRef(new Audio())

  // Photos - You can replace these URLs with your own images in public/images/
const [photos] = useState([
  { id: 1, url: '/images/photo1.jpg', caption: 'Our First Date' },
  { id: 2, url: '/images/2.jpg', caption: 'Sweet Memories' },
  { id: 3, url: '/images/3.jpg', caption: 'Perfect Day' },
  { id: 4, url: '/images/4.jpg', caption: 'Just Us' },
  { id: 5, url: '/images/5.jpg', caption: 'My Love' },
  { id: 6, url: '/images/6.jpg', caption: 'Forever Us' }
])


  // Page states
  const [currentPage, setCurrentPage] = useState('intro')
  const [noClickCount, setNoClickCount] = useState(0)
  const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 })
  const [noButtonText, setNoButtonText] = useState('NO')
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showQuizResult, setShowQuizResult] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [wrongAttempts, setWrongAttempts] = useState(0)

  // Photo Stack states
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [dragStart, setDragStart] = useState(null)
  const [dragOffset, setDragOffset] = useState(0)

  const noMessages = [
    "NO",
    "Are you sure? 🥺",
    "Really? 😢",
    "Please reconsider 💔",
    "Don't break my heart 😭",
    "Think again! 💕",
    "Last chance! ❤️"
  ]

  const quizQuestions = [
    {
      question: "Who is the absolute 'Boss' in this relationship 😏?",
      options: [
        { text: "Obviously You", correct: true },
        { text: "Me", correct: false },
        { text: "My Mom", correct: false }
      ]
    },
    {
      question: "Where do I plan to spend the rest of my life 🥰?",
      options: [
        { text: "Paris", correct: false },
        { text: "In Your Heart", correct: true },
        { text: "On Mars", correct: false }
      ]
    },
    {
      question: "What's my favorite thing about you? 💕",
      options: [
        { text: "Your Smile", correct: false },
        { text: "Your Eyes", correct: false },
        { text: "Everything", correct: true }
      ]
    },
    {
      question: "How much do I love you? ❤️",
      options: [
        { text: "A Lot", correct: false },
        { text: "To The Moon and Back", correct: false },
        { text: "More Than Words Can Say", correct: true }
      ]
    }
  ]

  // Music mapping for each page - Using PUBLIC folder (NO IMPORTS!)
  const musicMap = {
    intro: '/music/Girl.mp3',
    main: '/music/KHAIRIYAT.mp3',
    gifts: '/music/Zaalima.mp3',
    photoStack: '/music/Zaalima.mp3',
    collage: '/music/Tera.mp3',
    quiz: '/music/Pehli.mp3',
    success: '/music/With.mp3'
  }

  // Play music based on current page
  useEffect(() => {
    if (!isMusicOn) {
      audioRef.current.pause()
      return
    }

    const newMusic = musicMap[currentPage]
    if (newMusic) {
      audioRef.current.src = newMusic
      audioRef.current.loop = true
      audioRef.current.volume = 0.5
      audioRef.current.play().catch(() => {
        console.log('Music autoplay blocked - user needs to interact first')
      })
    }

    return () => {
      audioRef.current.pause()
    }
  }, [currentPage, isMusicOn])

  // Handle user authentication
  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthError('')
    setIsLoading(true)

    try {
      const response = await fetch('https://velen-o7nr.onrender.com/api/verify-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: inputName })
      })

      const data = await response.json()

      if (data.success) {
        setIsAuthenticated(true)
        setUserName(data.userName)
        sessionStorage.setItem('authenticated', 'true')
        sessionStorage.setItem('userName', data.userName)
      } else {
        setAuthError(data.message || 'Access Denied 💔')
        setInputName('')
      }
    } catch (error) {
      setAuthError('Connection error. Make sure backend server is running on port 5000!')
      console.error('Authentication error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Check session on mount
  useEffect(() => {
    const auth = sessionStorage.getItem('authenticated')
    const name = sessionStorage.getItem('userName')
    if (auth === 'true' && name) {
      setIsAuthenticated(true)
      setUserName(name)
    }
  }, [])

  // Auto transition from intro
  useEffect(() => {
    if (currentPage === 'intro' && isAuthenticated) {
      const timer = setTimeout(() => setCurrentPage('main'), 3000)
      return () => clearTimeout(timer)
    }
  }, [currentPage, isAuthenticated])

  // Photo Stack Functions
  const handleMouseDown = (e) => {
    setDragStart(e.clientX)
  }

  const handleMouseMove = (e) => {
    if (dragStart !== null) {
      const diff = e.clientX - dragStart
      setDragOffset(diff)
    }
  }

  const handleMouseUp = () => {
    if (Math.abs(dragOffset) > 50) {
      if (dragOffset > 0) {
        if (currentPhotoIndex > 0) {
          setCurrentPhotoIndex(currentPhotoIndex - 1)
        }
      } else {
        if (currentPhotoIndex < photos.length - 1) {
          setCurrentPhotoIndex(currentPhotoIndex + 1)
        }
      }
    }
    setDragStart(null)
    setDragOffset(0)
  }

  const handlePrevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1)
    }
  }

  const handleNextPhoto = () => {
    if (currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1)
    }
  }

  const handlePhotoStackComplete = () => {
    setCurrentPage('collage')
  }

  const handleNoClick = () => {
    const newCount = noClickCount + 1
    setNoClickCount(newCount)
    const maxX = 200
    const maxY = 100
    const randomX = (Math.random() - 0.5) * maxX
    const randomY = (Math.random() - 0.5) * maxY
    setNoButtonPosition({ x: randomX, y: randomY })
    if (newCount < noMessages.length) {
      setNoButtonText(noMessages[newCount])
    } else {
      setNoButtonText('?')
    }
  }

  const createConfetti = () => {
    const confetti = document.createElement('div')
    confetti.className = 'confetti'
    confetti.style.left = Math.random() * 100 + '%'
    const colors = ['#ff6b6b', '#ffd93d', '#6bcf7f', '#4d96ff']
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)]
    confetti.style.animationDelay = Math.random() * 2 + 's'
    document.body.appendChild(confetti)
    setTimeout(() => confetti.remove(), 3000)
  }

  const createFallingHeart = () => {
    const heart = document.createElement('div')
    heart.className = 'falling-heart'
    heart.innerHTML = ['❤️', '💕', '💖', '💗', '💝', '💞'][Math.floor(Math.random() * 6)]
    heart.style.left = Math.random() * 100 + '%'
    heart.style.fontSize = (Math.random() * 30 + 20) + 'px'
    heart.style.animationDuration = (Math.random() * 2 + 3) + 's'
    heart.style.animationDelay = Math.random() * 0.5 + 's'
    document.body.appendChild(heart)
    setTimeout(() => heart.remove(), 5000)
  }

  const handleYesClick = () => setCurrentPage('gifts')
  const handleGiftClick = () => setCurrentPage('photoStack')
  const handleSeeThisClick = () => setCurrentPage('quiz')

  const handleQuizAnswer = (isCorrect, index) => {
    setSelectedAnswer(index)
    
    if (isCorrect) {
      setShowQuizResult(true)
      setTimeout(() => {
        if (currentQuestionIndex < quizQuestions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1)
          setSelectedAnswer(null)
          setShowQuizResult(false)
          setWrongAttempts(0)
        } else {
          setCurrentPage('success')
          setCurrentQuestionIndex(0)
          setSelectedAnswer(null)
          setShowQuizResult(false)
          for (let i = 0; i < 50; i++) setTimeout(() => createConfetti(), i * 50)
          for (let i = 0; i < 30; i++) setTimeout(() => createFallingHeart(), i * 100)
        }
      }, 1500)
    } else {
      setWrongAttempts(wrongAttempts + 1)
      setShowQuizResult(true)
      setTimeout(() => {
        setSelectedAnswer(null)
        setShowQuizResult(false)
      }, 1500)
    }
  }

  const TeddyBear = () => (
    <div className="teddy">
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="50" fill="#d4a574" />
        <circle cx="75" cy="75" r="20" fill="#d4a574" />
        <circle cx="125" cy="75" r="20" fill="#d4a574" />
        <circle cx="85" cy="95" r="5" fill="#3d2817" />
        <circle cx="115" cy="95" r="5" fill="#3d2817" />
        <ellipse cx="100" cy="105" rx="8" ry="6" fill="#3d2817" />
        <path d="M 90 115 Q 100 120 110 115" stroke="#3d2817" strokeWidth="2" fill="none" />
        <circle cx="70" cy="140" r="15" fill="#d4a574" />
        <circle cx="130" cy="140" r="15" fill="#d4a574" />
        <ellipse cx="100" cy="160" rx="25" ry="30" fill="#d4a574" />
        <circle cx="80" cy="180" r="12" fill="#d4a574" />
        <circle cx="120" cy="180" r="12" fill="#d4a574" />
      </svg>
    </div>
  )

  const FloatingHearts = () => {
    const hearts = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 15,
      size: Math.random() * 20 + 10
    }))
    return (
      <>
        {hearts.map((heart) => (
          <div key={heart.id} className="heart-bg" style={{ left: `${heart.left}%`, animationDelay: `${heart.delay}s`, fontSize: `${heart.size}px` }}>
            ❤️
          </div>
        ))}
      </>
    )
  }

  const GiftBox = ({ emoji, label, onClick }) => (
    <div className="gift-box" onClick={onClick}>
      <div className="gift-emoji">{emoji}</div>
      <div className="gift-label">{label}</div>
    </div>
  )

  // Music Toggle Button
  const MusicToggle = () => (
    <button 
      className="music-toggle-btn"
      onClick={() => setIsMusicOn(!isMusicOn)}
      title={isMusicOn ? 'Mute Music' : 'Unmute Music'}
    >
      {isMusicOn ? '🔊' : '🔇'}
    </button>
  )

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="app">
        <FloatingHearts />
        <MusicToggle />
        <div className="container">
          <div className="corner-hearts top-left">💕</div>
          <div className="corner-hearts top-right">💕</div>
          <div className="corner-hearts bottom-left">💕</div>
          <div className="corner-hearts bottom-right">💕</div>

          <div className="login-screen">
            <h1 className="login-title">💝 Welcome 💝</h1>
            <p className="login-subtitle">Enter your name to continue</p>
            
            <form onSubmit={handleLogin} className="login-form">
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="Your Name"
                className="login-input"
                disabled={isLoading}
                autoFocus
              />
              
              {authError && <p className="error-message">{authError}</p>}
              
              <button type="submit" className="login-btn" disabled={isLoading || !inputName.trim()}>
                {isLoading ? 'Verifying...' : 'Enter 💖'}
              </button>
            </form>

            <p className="login-note">✨ Only special people can access this ✨</p>
          </div>
        </div>
      </div>
    )
  }

  // MAIN APP
  return (
    <div className="app">
      <FloatingHearts />
      <MusicToggle />
      <div className="container">
        <div className="corner-hearts top-left">💕</div>
        <div className="corner-hearts top-right">💕</div>
        <div className="corner-hearts bottom-left">💕</div>
        <div className="corner-hearts bottom-right">💕</div>

        {currentPage === 'intro' && (
          <div className="intro-screen">
            <h1 className="intro-title">For Valentine:</h1>
            <h2 className="intro-subtitle">Normal gifts are boring</h2>
            <div className="intro-emoji">🎁</div>
          </div>
        )}

        {currentPage === 'main' && (
          <div className="main-screen">
            <TeddyBear />
            <h1>Will you be mine <span className="emoji">🥺</span>?</h1>
            <p className="message">Life is an incredible journey, and I want to spend every single second of it with you.</p>
            <div className="buttons">
              <button className="yes-btn" onClick={handleYesClick}>YES 💖</button>
              <button className="no-btn" onClick={handleNoClick} style={{ transform: `translate(${noButtonPosition.x}px, ${noButtonPosition.y}px) scale(${Math.max(0.5, 1 - noClickCount * 0.15)})`, fontSize: noClickCount > 8 ? '0.5em' : '1.2em' }}>
                {noButtonText}
              </button>
            </div>
          </div>
        )}

        {currentPage === 'gifts' && (
          <div className="gifts-screen">
            <h1 className="gifts-title">Pick Your Gift! 🎁</h1>
            <p className="gifts-subtitle">Choose one to see the magic ✨</p>
            <div className="gifts-grid">
              <GiftBox emoji="💐" label="Flowers" onClick={handleGiftClick} />
              <GiftBox emoji="🍫" label="Chocolate" onClick={handleGiftClick} />
              <GiftBox emoji="💍" label="Ring" onClick={handleGiftClick} />
              <GiftBox emoji="🧸" label="Teddy Bear" onClick={handleGiftClick} />
              <GiftBox emoji="💝" label="Love Letter" onClick={handleGiftClick} />
              <GiftBox emoji="🎂" label="Cake" onClick={handleGiftClick} />
            </div>
          </div>
        )}

        {currentPage === 'photoStack' && (
          <div className="photo-stack-screen">
            <h1 className="photos-title">Our Beautiful Memories 📸</h1>
            
            <div className="photo-stack-container">
              <div
                className="photo-card-stack"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ transform: `translateX(${dragOffset}px)`, cursor: 'grab' }}
              >
                {photos[currentPhotoIndex] && (
                  <div className="photo-card-item">
                    <img 
                      src={photos[currentPhotoIndex].url} 
                      alt={photos[currentPhotoIndex].caption}
                      draggable={false}
                    />
                    <div className="photo-info">
                      <p className="photo-caption">{photos[currentPhotoIndex].caption}</p>
                      <p className="photo-counter">{currentPhotoIndex + 1} / {photos.length}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="photo-stack-controls">
                <button 
                  onClick={handlePrevPhoto}
                  disabled={currentPhotoIndex === 0}
                  className="photo-btn prev-btn"
                >
                  ⬅️ Previous
                </button>
                <button 
                  onClick={handleNextPhoto}
                  disabled={currentPhotoIndex === photos.length - 1}
                  className="photo-btn next-btn"
                >
                  Next ➡️
                </button>
              </div>

              {currentPhotoIndex === photos.length - 1 && (
                <button 
                  onClick={handlePhotoStackComplete}
                  className="yes-btn large-btn"
                >
                  View Collage 💕
                </button>
              )}
            </div>

            <p className="hint-text">💡 Drag left/right or use buttons to view photos</p>
          </div>
        )}

        {currentPage === 'collage' && (
          <div className="collage-screen">
            <h1 className="collage-title">Our Beautiful Collage 🎨</h1>
            
            <div className="collage-grid">
              {photos.map((photo) => (
                <div key={photo.id} className="collage-item">
                  <img src={photo.url} alt={photo.caption} />
                  <p className="collage-caption">{photo.caption}</p>
                </div>
              ))}
            </div>

            <button 
              onClick={handleSeeThisClick}
              className="yes-btn large-btn"
            >
              Continue to Quiz ❤️
            </button>
          </div>
        )}

        {currentPage === 'quiz' && (
          <div className="quiz-screen">
            <h1 className="quiz-title">Quiz for you 😏</h1>
            <p className="quiz-progress">Question {currentQuestionIndex + 1} of {quizQuestions.length}</p>
            <div className="quiz-container">
              <p className="quiz-question">{quizQuestions[currentQuestionIndex].question}</p>
              <div className="quiz-options">
                {quizQuestions[currentQuestionIndex].options.map((option, index) => (
                  <button 
                    key={index} 
                    className={`quiz-option ${selectedAnswer === index ? (option.correct ? 'correct' : 'wrong') : ''}`} 
                    onClick={() => handleQuizAnswer(option.correct, index)} 
                    disabled={selectedAnswer !== null}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
              {showQuizResult && selectedAnswer !== null && quizQuestions[currentQuestionIndex].options[selectedAnswer].correct && (
                <p className="quiz-result correct-result">Correct! You're so smart! 😍</p>
              )}
              {showQuizResult && selectedAnswer !== null && !quizQuestions[currentQuestionIndex].options[selectedAnswer].correct && (
                <p className="quiz-result wrong-result">Oops! Try again 😅 (Attempt {wrongAttempts})</p>
              )}
            </div>
          </div>
        )}

        {currentPage === 'success' && (
          <div className="success-screen">
            <div className="celebration">🎉💖🎊</div>
            <h1>Yaaay! 🥳</h1>
            <p className="love-message">
              I'm so happy! ❤️<br />
              You've made me the happiest person alive! 💕<br />
              Can't wait to create beautiful memories together! 🌹 <br />
              Paglu 💕 <br />
            </p>
            <div style={{ fontSize: '4em', marginTop: '30px' }}>💑 💕 🌟</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
