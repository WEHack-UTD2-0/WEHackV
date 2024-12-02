"use client";

import React, { useState, useEffect, useTransition } from 'react';
import './Team.css';

function Team() {
 const teamMembers = [
   { name: 'Maheen Ferdouse', role: 'Co-Director', image: '/img/static/images/team/maheen.webp' },
   { name: 'Mansi Patel', role: 'Co-Director', image: '/img/static/images/team/mansi.webp' },   
   { name: 'Clowie Garcia', role: 'Advisor', image: '/img/static/images/team/clowie.webp' },
   { name: 'Shivani Zala', role: 'Experience Director', image: '/img/static/images/team/shivani.webp' },
   { name: 'Gayathri Jayaraman', role: 'Experience Coordinator', image: '/img/static/images/team/gayathri.webp' },
//    { name: 'Timage Abubaker', role: 'Experience Coordinator', image: '/static/images/team/timage.jpg' },
   { name: 'Toby Estipona', role: 'Experience Coordinator', image: '/img/static/images/team/toby.webp' },
   { name: 'Shreya Ram', role: 'Industry Director', image: '/img/static/images/team/shreya.webp' },
   { name: 'Sanjana Kotha', role: 'Industry Coordinator', image: '/img/static/images/team/sanjana.webp' },
   { name: 'Mariyam Zaki', role: 'Industry Coordinator', image: '/img/static/images/team/mariyam.webp' },
   { name: 'Dharshini Mahesh', role: 'Industry Coordinator', image: '/img/static/images/team/dharshini.webp' },
   { name: 'Elisa Paul', role: 'Industry Coordinator', image: '/img/static/images/team/elisa.webp' },
   { name: 'Hemal Pathak', role: 'Logistics Director', image: '/img/static/images/team/hemal.webp' },
   { name: 'Nivedha Sreenivasan', role: 'Logistics Coordinator', image: '/img/static/images/team/nivedha.webp' },
   { name: 'Oviya Selvakumar', role: 'Logistics Coordinator', image: '/img/static/images/team/oviya.webp' },
   { name: 'Shriya Rajesh', role: 'Logistics Coordinator', image: '/img/static/images/team/shriya.webp' },
   { name: 'Sri Vellanki', role: 'Logistics Coordinator', image: '/img/static/images/team/sri.webp' },
   { name: 'Rita Kaushik', role: 'Marketing Directior', image: '/img/static/images/team/rita.webp' },
   { name: 'Faith Omoye', role: 'Marketing Coordinator', image: '/img/static/images/team/faith.webp' },
   { name: 'Kanchan Javalkar', role: 'Marketing Coordinator', image: '/img/static/images/team/kanchan.webp' },
   { name: 'Meghan Grayson', role: 'Marketing Coordinator', image: '/img/static/images/team/meghan.webp' },
   { name: 'Nazihah Hossain', role: 'Marketing Coordinator', image: '/img/static/images/team/nazihah.webp' },
   // Zara doesn't have a new photo yet
   // { name: 'Zara Iqbal', role: 'Marketing Coordinator', image: '/static/images/zara.jpg' },
   { name: 'Sneha Bista', role: 'Development Director', image: '/img/static/images/team/sneha.webp' },
   { name: 'Annie Li', role: 'Development Coordinator', image: '/img/static/images/team/annie.webp' },
   { name: 'Clara Conner', role: 'Development Coordinator', image: '/img/static/images/team/clara.webp' },
   { name: 'Safia Sharif', role: 'Development Coordinator', image: '/img/static/images/team/safia.webp' },
   { name: 'Zubiya Syeda', role: 'Development Coordinator', image: '/img/static/images/team/zubiya.webp' },
 ];

 const [startIndex, setStartIndex] = useState(0);
 const [visibleCount, setVisibleCount] = useState(6); 
 const [isPending, startTransition] = useTransition();

 useEffect(() => {
  const handleResize = () => {
    if (window.innerWidth > 1300) {
        setVisibleCount(8);
        return 8;
    } else if (window.innerWidth > 600) {
      setVisibleCount(6); 
        return 6;
    } else {
      setVisibleCount(6);
        return 6;
    }
  };

  handleResize(); 
  window.addEventListener('resize', handleResize);
  
  return () => window.removeEventListener('resize', handleResize);
 }, []);

 const offset = () => {
  if (window.innerWidth > 1300) {
      setVisibleCount(8);
      return 8;
  } else if (window.innerWidth > 600) {
    setVisibleCount(6); 
      return 6;
  } else {
    setVisibleCount(6);
      return 6;
  }}

 const handleNext = () => {
    startTransition(() => {
        setStartIndex((prevIndex) => (prevIndex + offset()) % teamMembers.length);
    });
 };

 const handlePrev = () => {
    startTransition(() => {
        setStartIndex((prevIndex) => (prevIndex - offset() + teamMembers.length) % teamMembers.length);
    });
 };

 // Create an array of visible members based on startIndex
 const visibleMembers = Array.from({ length: visibleCount }, (_, index) => {
    const memberIndex = (startIndex + index) % teamMembers.length;
    return teamMembers[memberIndex];
 });

 return (
  <div className='w-full h-auto flex flex-wrap flex-col items-center justify-center py-40 lg:px-32' id="Team">
    <div className="title-container flex flex-col md:flex-row justify-center items-center gap-y-2 md:gap-x-16 lg:gap-x-24 pb-24 md:pb-24 lg:pb-36">      
        <div className="glow-team transform-gpu">
            <h1 className='Team-title text-[#992444] text-center text-4xl md:text-5xl lg:text-5xl'>Meet the Team</h1>
        </div>
    </div>
    <div className="polaroid-container">
      {visibleMembers.map((member, index) => (
        <div 
          key={index} 
          className={`polaroid ${isPending && index === 0 ? 'fade-out' : ''}`} // Apply fade-out only to the first item
        >
          <img src={member.image} alt={member.name} className="polaroid-image" loading="lazy" />
          <div className="polaroid-text">
            <h3 className="position-text font-bold">{member.name}</h3>
            <p className="role-text">{member.role}</p>
          </div>
        </div>
      ))}
    </div>
    <div className="flex justify-center -mt-10 md:-mt-20 w-full max-w-6xl items-center">
      <img 
        src="/img/static/images/arrow-left.png" 
        alt="Previous" 
        onClick={handlePrev} 
        className="nav-button cursor-pointer" 
      />
      <img 
        src="/img/static/images/arrow-right.png" 
        alt="Next" 
        onClick={handleNext} 
        className="nav-button cursor-pointer" 
      />
    </div>
    
  </div>
 );
}

export default Team;