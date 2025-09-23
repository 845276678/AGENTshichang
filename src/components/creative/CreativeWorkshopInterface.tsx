'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import {
  CreativeWorkshop,
  _WorkshopExercise,
  _CreativeAgent
} from '@/types'
import {
  Brain,
  Clock,
  Users,
  Zap,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Send,
  Lightbulb,
  Target,
  BarChart3,
  Presentation,
  _Timer,
  Star,
  Trophy,
  BookOpen
} from 'lucide-react'

interface CreativeWorkshopProps {
  workshop: CreativeWorkshop
  onSubmitExercise: (exerciseId: string, submission: string) => void
  onCompleteWorkshop: () => void
  currentUserId: string
}

const difficultyColors = {
  BEGINNER: 'bg-green-500',
  INTERMEDIATE: 'bg-yellow-500',
  ADVANCED: 'bg-red-500'
}

const difficultyLabels = {
  BEGINNER: '鍏ラ棬',
  INTERMEDIATE: '杩涢樁',
  ADVANCED: '楂樼骇'
}

const exerciseTypeIcons = {
  IDEATION: Lightbulb,
  REFINEMENT: RotateCcw,
  EVALUATION: BarChart3,
  PRESENTATION: Presentation
}

const exerciseTypeLabels = {
  IDEATION: '鍒涙剰鐢熸垚',
  REFINEMENT: '浼樺寲鏀硅繘',
  EVALUATION: '璇勪及鍒嗘瀽',
  PRESENTATION: '灞曠ず琛ㄨ揪'
}

const workshopTypeLabels = {
  TECHNICAL_INNOVATION: 'Technical Innovation',
  CREATIVE_STORYTELLING: 'Creative Storytelling',
  BUSINESS_MODELING: 'Business Modeling',
  CROSS_DOMAIN_THINKING: 'Cross-domain Thinking',
  PROBLEM_SOLVING: 'Problem Solving'
}

export const CreativeWorkshopInterface: React.FC<CreativeWorkshopProps> = ({
  workshop,
  onSubmitExercise,
  onCompleteWorkshop,
  __currentUserId
}) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [exerciseSubmissions, setExerciseSubmissions] = useState<Record<string, string>>({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [currentSubmission, setCurrentSubmission] = useState('')

  const currentExercise = workshop.exercises[currentExerciseIndex]
  const progress = ((currentExerciseIndex + 1) / workshop.exercises.length) * 100

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsActive(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isActive, timeRemaining])

  const startExercise = () => {
    setTimeRemaining(currentExercise.timeLimit * 60) // 杞崲涓虹
    setIsActive(true)
  }

  const pauseExercise = () => {
    setIsActive(false)
  }

  const submitExercise = () => {
    if (currentSubmission.trim()) {
      onSubmitExercise(currentExercise.id, currentSubmission.trim())
      setExerciseSubmissions(prev => ({
        ...prev,
        [currentExercise.id]: currentSubmission.trim()
      }))
      setCurrentSubmission('')

      if (currentExerciseIndex < workshop.exercises.length - 1) {
        setCurrentExerciseIndex(prev => prev + 1)
        setIsActive(false)
        setTimeRemaining(0)
      } else {
        onCompleteWorkshop()
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const ExerciseIcon = exerciseTypeIcons[currentExercise?.exerciseType]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 宸ヤ綔鍧婂ご閮ㄤ俊鎭?*/}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-agent-500/10" />
        <CardHeader className="relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-agent-500/20 flex items-center justify-center border">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl mb-2">{workshop.title}</CardTitle>
                <p className="text-muted-foreground mb-3">{workshop.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="outline">
                    {workshopTypeLabels[workshop.type]}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`${difficultyColors[workshop.difficulty]} text-white border-transparent`}
                  >
                    {difficultyLabels[workshop.difficulty]}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {workshop.duration} 鍒嗛挓
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {workshop.currentParticipants}/{workshop.maxParticipants}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">主持人</div>
              <div className="font-semibold">{workshop.hostAgent.name}</div>
              <div className="text-xs text-muted-foreground">
                {workshop.hostAgent.personality.communicationStyle}椋庢牸
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 杩涘害鎸囩ず鍣?*/}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">缁冧範杩涘害</h3>
              <span className="text-sm text-muted-foreground">
                {currentExerciseIndex + 1} / {workshop.exercises.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              {workshop.exercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className={`flex flex-col items-center ${
                    index <= currentExerciseIndex ? 'text-primary' : ''
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
                      index < currentExerciseIndex
                        ? 'bg-primary text-primary-foreground'
                        : index === currentExerciseIndex
                        ? 'bg-primary/20 border-2 border-primary'
                        : 'bg-secondary'
                    }`}
                  >
                    {index < currentExerciseIndex ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <span className="text-xs">{index + 1}</span>
                    )}
                  </div>
                  <span className="text-center max-w-16">
                    {exerciseTypeLabels[exercise.exerciseType]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 褰撳墠缁冧範 */}
      {currentExercise && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-agent-500/20 flex items-center justify-center">
                <ExerciseIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl">{currentExercise.title}</h3>
                <p className="text-sm text-muted-foreground font-normal">
                  {exerciseTypeLabels[currentExercise.exerciseType]} 鈥?{currentExercise.timeLimit} 鍒嗛挓闄愭椂
                </p>
              </div>
              {timeRemaining > 0 && (
                <div className="ml-auto text-right">
                  <div className="text-2xl font-mono text-primary">
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="text-xs text-muted-foreground">鍓╀綑鏃堕棿</div>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 缁冧範鎻忚堪 */}
            <div className="prose prose-sm max-w-none">
              <p>{currentExercise.description}</p>
            </div>

            {/* 缁冧範鎸囧 */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  缁冧範鎸囧
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {currentExercise.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center mt-0.5 flex-shrink-0">
                        {index + 1}
                      </span>
                      {instruction}
                    </li>
                  ))}
                </ul>
              </div>

              {currentExercise.constraints && currentExercise.constraints.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    鍒涗綔绾︽潫
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {currentExercise.constraints.map((constraint, index) => (
                      <Badge key={index} variant="outline">
                        {constraint}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {currentExercise.examples && currentExercise.examples.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    鍙傝€冪ず渚?                  </h4>
                  <div className="space-y-2">
                    {currentExercise.examples.map((example, index) => (
                      <div key={index} className="p-3 bg-secondary/20 rounded-lg text-sm">
                        {example}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 鏃堕棿鎺у埗 */}
            <div className="flex gap-2">
              {!isActive && timeRemaining === 0 && (
                <Button onClick={startExercise} className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  寮€濮嬬粌涔?                </Button>
              )}
              {isActive && (
                <Button onClick={pauseExercise} variant="outline" className="flex items-center gap-2">
                  <Pause className="w-4 h-4" />
                  鏆傚仠
                </Button>
              )}
              {!isActive && timeRemaining > 0 && (
                <Button onClick={() => setIsActive(true)} className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  缁х画
                </Button>
              )}
            </div>

            {/* 鎻愪氦鍖哄煙 */}
            <div className="space-y-3">
              <h4 className="font-semibold">浣犵殑鍒涗綔</h4>
              <Textarea
                value={currentSubmission}
                onChange={(e) => setCurrentSubmission(e.target.value)}
                placeholder="鍦ㄨ繖閲岃緭鍏ヤ綘鐨勫垱鎰忔兂娉曘€佽В鍐虫柟妗堟垨鍒嗘瀽..."
                className="min-h-[120px]"
                disabled={!isActive && timeRemaining === 0}
              />
              <div className="flex justify-between items-center">
                <div className="text-xs text-muted-foreground">
                  {currentSubmission.length} 瀛楃
                </div>
                <Button
                  onClick={submitExercise}
                  disabled={!currentSubmission.trim()}
                  className="flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {currentExerciseIndex === workshop.exercises.length - 1 ? '完成工作坊' : '提交并继续'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 瀹屾垚鐨勭粌涔犲洖椤?*/}
      {Object.keys(exerciseSubmissions).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              宸插畬鎴愮殑缁冧範
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {workshop.exercises.slice(0, currentExerciseIndex).map((exercise, _index) => (
              <div key={exercise.id} className="p-4 bg-secondary/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="font-medium">{exercise.title}</span>
                  <Badge variant="outline" className="ml-auto">
                    {exerciseTypeLabels[exercise.exerciseType]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {exerciseSubmissions[exercise.id]}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

