import Image from 'next/image'

export default function Logo() {
  return (
    <div className="flex items-center">
      <Image 
        src="/logo.png" 
        alt="Mersey Bathrooms" 
        width={200} 
        height={60}
        priority
        className="object-contain"
      />
    </div>
  )
}
