import { motion, AnimatePresence } from 'framer-motion'

// Action components
import ChatModerator from '@/pages/game/miniGame/chatModerator/ChatModerator'
import SymtomSorter from '@/pages/game/miniGame/symtomSorter/SymtomSorter'
import HowYouReact from '@/pages/game/miniGame/houYouReact/HowYouReact'
import AuthenticationFactorGame from '@/pages/game/miniGame/mfa/MultiFactorAuthentication'
import DigitalFootprint from '@/pages/game/miniGame/digitalFootprint/DigitalFootprint'
import BackpackActionComponent from './action_cmp/backpack/BackpackActionComponent'
import FootprintVideo from './action_cmp/footprintVideo/FootprintVideo'
import LunaPost from './action_cmp/lunaPost/LunaPost'
import MiloPost from './action_cmp/miloPost/MiloPost'
import PostBook from './action_cmp/postBook/PostBook'
import Pacman from '@/pages/game/miniGame/pacman/Pacman'
import Tshirt from './action_cmp/tshirt/Tshirt'
import PuzzleDrop from './action_cmp/puzzleDrop/PuzzleDrop'
import PlushToy from './action_cmp/plushToy/PlushToy'
import SmartGoggle from './action_cmp/smartGoogle/SmartGoggle'
import IpAddressGame from '@/pages/game/miniGame/ipAddress/IpAddressGame'
import IpAddressScrap from './action_cmp/ipAddressScrap/IpAddressScrap'
import SearchWarrant from './action_cmp/searchWarrant/SearchWarrant'
import PhoneCall from './action_cmp/phoneCall/PhoneCall'
import ReceivePhoneCall from './action_cmp/receivePhoneCall/ReceivePhoneCall'
import SnappyPal from './action_cmp/snappyPal/SnappyPal'
import SnappyPalMap from './action_cmp/snappyPal/SnappyPalMap'
import ApplyUni from './action_cmp/applyUni/ApplyUni'
import ImagePopUp from './action_cmp/imagePopUp/ImagePopUp'
import SavePasswordAction from './action_cmp/savePasssword/SavePasswordAction'
import ImageSoundAction from './action_cmp/imageSound/ImageSoundAction'
import PhoneCode from './action_cmp/phoneCode/PhoneCode'
import ThumbScan from './action_cmp/thumbScan/ThumbScan'
import SpeakerVolume from './action_cmp/speakerVolume/SpeakerVolume'
import OutSmart from '@/pages/game/miniGame/outSmart/OutSmart'
import GhostHunt from '@/pages/game/miniGame/ghostHunt/GhostHuntPage'
import DangerAlert from './action_cmp/dangerAlert/DangerAlert'
import PhoneMessage from './action_cmp/phoneMessage/PhoneMessage'
import WhatYouSee from './action_cmp/whatYouSee/WhatYouSee'
import BookPage from './action_cmp/bookPage/BookPage'
import Paparazzi from './action_cmp/paparazzi/Paparazzi'
import ShouldYouPost from './action_cmp/shouldYouPost/ShouldYouPost'
import LetterPopup from './action_cmp/letterPopup/LetterPopup'
import GhostHuntPage from '@/pages/game/miniGame/ghostHunt/GhostHuntPage'
import PlayNarration from './action_cmp/playNarration/PlayNarration'
import PasswordInspector from '@/pages/game/miniGame/passwordInsperctor/PasswordInspector'
import CyberDefinition from './action_cmp/cyberDefinition/CyberDefinition'
import TrustedAdults from './action_cmp/trustedAdults/TrustedAdults'
import SpiderMove from './action_cmp/spiderMove/SpiderMove'

const ActionOverlay = ({ showDocument, currentDialogue, onCloseDocument }) => {
  if (!showDocument || !currentDialogue?.action?.type) {
    return null
  }

  const actionType = currentDialogue.action.type
  const actionData =
    currentDialogue.action.action_data || currentDialogue.action.data

  const renderActionComponent = () => {
    switch (actionType) {
      case 'spider_moving':
        return <SpiderMove onComplete={onCloseDocument} />

      case 'open_chat_room':
        return <div>Hello</div>

      case 'start_game_mode':
        return <ChatModerator onComplete={onCloseDocument} />

      case 'cyber_definition':
        return <CyberDefinition onComplete={onCloseDocument} />

      case 'sort_the_symptoms':
        return <SymtomSorter onComplete={onCloseDocument} />

      case 'how_would_you_react':
        return <HowYouReact onComplete={onCloseDocument} />

      case 'trusted_adults':
        return <TrustedAdults onComplete={onCloseDocument} />

      case 'backpack':
        return <BackpackActionComponent onComplete={onCloseDocument} />

      case 'footprint_video':
        return (
          <FootprintVideo
            onComplete={onCloseDocument}
            videoId={currentDialogue?.action?.videoId}
            duration={currentDialogue?.action?.duration}
          />
        )

      case 'luna_post':
        return <LunaPost onComplete={onCloseDocument} />

      case 'milo_post':
        return <MiloPost onComplete={onCloseDocument} />

      case 'post_book':
        return <PostBook onComplete={onCloseDocument} />

      case 'game_pacman':
        return <Pacman onComplete={onCloseDocument} />

      case 'tshirt':
        return <Tshirt onComplete={onCloseDocument} />

      case 'puzzle_drop':
        return <PuzzleDrop onComplete={onCloseDocument} />

      case 'plush_toy':
        return <PlushToy onComplete={onCloseDocument} />

      case 'swimming_goggles':
        return <SmartGoggle onComplete={onCloseDocument} />

      case 'ip_address_game':
        return <IpAddressGame onComplete={onCloseDocument} />

      case 'ip_address_image':
        return <IpAddressScrap onComplete={onCloseDocument} />

      case 'search_warrant':
        return <SearchWarrant onComplete={onCloseDocument} />

      case 'phone_call':
        return <PhoneCall data={actionData} onComplete={onCloseDocument} />

      case 'receive_phone_call':
        return (
          <ReceivePhoneCall data={actionData} onComplete={onCloseDocument} />
        )

      case 'snappy_pal_map':
        return <SnappyPalMap onComplete={onCloseDocument} />

      case 'snappy_pal':
        return <SnappyPal onComplete={onCloseDocument} />

      case 'erase_digital_footprint':
        return <DigitalFootprint onComplete={onCloseDocument} />

      case 'apply_uni':
        return <ApplyUni onComplete={onCloseDocument} />

      case 'image_popup':
        return <ImagePopUp data={actionData} onComplete={onCloseDocument} />

      case 'save_password':
        return <SavePasswordAction onComplete={onCloseDocument} />

      case 'image_sound':
        return (
          <ImageSoundAction data={actionData} onComplete={onCloseDocument} />
        )

      case 'phone_code':
        return <PhoneCode onComplete={onCloseDocument} />

      case 'thumb_scan':
        return <ThumbScan onComplete={onCloseDocument} />

      case 'out_smart':
        return <OutSmart onComplete={onCloseDocument} />

      case 'speaker_volume':
        return <SpeakerVolume onComplete={onCloseDocument} />

      case 'what_you_see':
        return <WhatYouSee onComplete={onCloseDocument} />

      case 'danger_alert':
        return <DangerAlert onComplete={onCloseDocument} />

      case 'phone_message':
        return <PhoneMessage onComplete={onCloseDocument} data={actionData} />

      case 'book_page':
        return <BookPage data={actionData} onComplete={onCloseDocument} />

      case 'paparazzi':
        return <Paparazzi onComplete={onCloseDocument} />

      case 'should_you_post':
        return <ShouldYouPost onComplete={onCloseDocument} />

      case 'letter_popup':
        return <LetterPopup onComplete={onCloseDocument} />

      case 'authentication_factor_game':
        return <AuthenticationFactorGame onComplete={onCloseDocument} />

      case 'ghost_hunt':
        return <GhostHuntPage onComplete={onCloseDocument} />

      case 'play_narration':
        return <PlayNarration onComplete={onCloseDocument} data={actionData} />

      case 'password_inspector':
        return <PasswordInspector onComplete={onCloseDocument} />

      default:
        return null
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className='action-overlay'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        {renderActionComponent()}
      </motion.div>
    </AnimatePresence>
  )
}

export default ActionOverlay
