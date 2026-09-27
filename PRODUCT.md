# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
นักศึกษาสายไอที (IT Students) ที่ชื่นชอบเกมแนวไขปริศนาร่วมกัน (Co-op Puzzle)

## Product Purpose
เกมไขปริศนาแบบ Co-op 2 ผู้เล่น ("Code In The Dark") ที่ผสานการเขียนโค้ด (Blockly) เข้ากับการสื่อสาร เพื่อพาสไปรต์ตัวละครหลบหลีกอุปสรรคและเข้าสู่เส้นชัยภายใต้ข้อจำกัดของเวลาและจำนวนบล็อกคำสั่ง

## Positioning
เกมมีจุดเด่นเรื่องความไม่สมมาตรของข้อมูล (Information Asymmetry) ที่บีบให้ต้องทำงานเป็นทีมอย่างหนัก:
- **Driver:** เห็นเป้าหมาย (Goal), อุปสรรคต่างๆ (Obstacles) และในอนาคตจะเห็นมอนสเตอร์
- **Navigator:** เห็นโครงสร้างกำแพง (Walls), หมอกบดบังทัศนวิสัย (Fog of War) และในอนาคตจะเห็นกล่องไอเทม

## Operating Context
- ผู้เล่น 2 คนเชื่อมต่อและเล่นพร้อมกันแบบ Real-time (Socket.io)
- มีการสื่อสารผ่านแชท หรือ Voice call นอกเกมเพื่อบอกทางกัน
- บังคับเล่นบนหน้าจอแนวนอนเท่านั้น (Landscape - Desktop / Tablet)

## Capabilities and Constraints
- รองรับหน้าจอแนวนอน (Landscape) เท่านั้น ไม่จำเป็นต้องรองรับมือถือแนวตั้ง
- มีระบบสลับบทบาท (Role Swap), จับเวลา (Timer) และจำกัดโควตาบล็อกโค้ด
- Tech Stack: React, Tailwind CSS, Blockly, Socket.io (Node.js)

## Brand Commitments
- **Theme:** อียิปต์โบราณ (Egyptian), ลึกลับ (Mystery), ทะเลทรายและพีระมิด
- **Visual Style:** 2D Pixel Art, Retro, สไตล์มินิมอล (Minimalist)
- **Color Palette:** โทนสีอบอุ่น (Warm tones)
