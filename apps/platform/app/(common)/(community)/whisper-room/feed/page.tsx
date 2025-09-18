
import { getWhisperFeed } from "~/actions/community.whisper";
import WhisperFeedClient from "./client";


export default async function WhisperFeedPage() {
  const whispers = await getWhisperFeed();


  return (<WhisperFeedClient whispers={whispers} />);
}
