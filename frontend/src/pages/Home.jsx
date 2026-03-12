import React from 'react'
import Hero from '../components/home/Hero'
import HowWorks from '../components/home/HowWorks'
import CounterBar from '../components/home/CounterBar'
import FooterTopHomeCTA from '../components/home/FooterTopHomeCTA'

const Home = () => {
    return (
        <div>
          <Hero/>
          <HowWorks/>
          <CounterBar/>
          <FooterTopHomeCTA/>
        </div>
    )
}

export default Home