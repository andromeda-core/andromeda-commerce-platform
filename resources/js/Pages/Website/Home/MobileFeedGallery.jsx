import React from 'react'
import SmartphoneMobileFeedGallery from "./SmartphoneMobileFeedGallery";
import PostMobileFeedGallery from './PostMobileFeedGallery';
const MobileFeedGallery = ({ feedGallery, setShowQrCode, setLinkCopied, auth, currency, cart_items, navigateToHashtag, placeholderImage, generateURL }) => {
  return (
    <>
      {feedGallery?.type === 'smartphones' && (
        <SmartphoneMobileFeedGallery
          smartphone={feedGallery}
          setShowQrCode={setShowQrCode}
          setLinkCopied={setLinkCopied}
          auth={auth}
          currency={currency}
          cart_items={cart_items}
          navigateToHashtag={navigateToHashtag}
          placeholderImage={placeholderImage}

        />
      )}



      {feedGallery?.type === 'posts' && (
        <PostMobileFeedGallery
          generateURL={generateURL}
          navigateToHashtag={navigateToHashtag}
          placeholderImage={placeholderImage}
          post={feedGallery}
          setLinkCopied={setLinkCopied}
          setShowQrCode={setShowQrCode}
        />
      )}
    </>
  )
}

export default MobileFeedGallery