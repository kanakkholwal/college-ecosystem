"use client"
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import { sliderImages } from "../constants"


const EmblaCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({}, [Autoplay({
    delay: 2000, // Delay between slides in milliseconds
    playOnInit: true, // Start autoplay when the carousel initializes
    stopOnInteraction: true, // Stop autoplay when user interacts with the carousel
    stopOnMouseEnter: true, // Stop autoplay when mouse enters the carousel
    stopOnFocusIn: true, // Stop autoplay when the carousel gains focus
    stopOnLastSnap: false, // Continue autoplay even on the last slide
    rootNode: null // Use default root node
  })])

  return (
    <section className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {sliderImages.map((image, index) => (
            <div className="embla__slide" key={index}>
              <Image src={image.src} alt={image.alt} className='embla__slide__img w-full h-full object-cover' 
              width={1200} height={600}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default EmblaCarousel
