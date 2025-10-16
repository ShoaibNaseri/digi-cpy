import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import SceneComponent from '../scene_cmp/SceneComponent'
import { saveMissionProgress } from '@/services/gameMissionProgress'
import GamePreloader from '@/components/common/GamePreloader'
const IntroSceneComponent = ({
  missionData,
  onComplete,
  dialogueBgImage,
  mainBackground,
  characterImageMap,
  currentStep
}) => {
  const { missionId } = useParams()
  const [isDigipalzHeadquarter, setIsDigipalzHeadquarter] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingContent, setLoadingContent] = useState(null)

  const handleSceneComplete = () => {
    onComplete(missionData?.next_scene)
  }
  // useEffect(() => {
  //   setTimeout(() => {
  //     setLoadingContent('Saving mission progress...')
  //     const missionDatas = {
  //       missionId: missionId,
  //       step: currentStep,
  //       progress: 0
  //     }
  //     saveMissionProgress(missionDatas)
  //     setIsLoading(false)
  //   }, 1000)
  // }, [])
  return (
    <>
      {/* {isLoading ? (
        <GamePreloader
          content='Saving mission progress...'
          isLoading={isLoading}
        />
      ) : null} */}
      <SceneComponent
        bgImage={mainBackground}
        comingData={missionData}
        dialogues={missionData?.dialogues}
        characters={missionData?.characters}
        characterImageMap={characterImageMap}
        dialogueBoxImage={dialogueBgImage}
        isFirstScene={true}
        onSceneComplete={handleSceneComplete}
        isDigipalzHeadquarter={isDigipalzHeadquarter}
      />
    </>
  )
}

export default IntroSceneComponent
