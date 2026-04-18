import { getStorage, ref, getDownloadURL } from 'firebase/storage'
import { app } from './firebase'

const storage = getStorage(app)

export async function getAudioUrl(date: string): Promise<string> {
  const audioRef = ref(storage, `audio/${date}.mp3`)
  return getDownloadURL(audioRef)
}
