import { WordEntry } from './types';

export const WORD_DICTIONARY: WordEntry[] = [
  // Everyday Objects
  { word: 'Television', category: 'Everyday Objects', difficulty: 'easy' },
  { word: 'Wristwatch', category: 'Everyday Objects', difficulty: 'easy' },
  { word: 'Umbrella', category: 'Everyday Objects', difficulty: 'easy' },
  { word: 'Toaster', category: 'Everyday Objects', difficulty: 'easy' },
  { word: 'Headphones', category: 'Everyday Objects', difficulty: 'easy' },
  { word: 'Scissors', category: 'Everyday Objects', difficulty: 'easy' },
  { word: 'Toothbrush', category: 'Everyday Objects', difficulty: 'easy' },
  { word: 'Alarm Clock', category: 'Everyday Objects', difficulty: 'medium' },
  { word: 'Suitcase', category: 'Everyday Objects', difficulty: 'medium' },

  // Animals
  { word: 'Spider', category: 'Animals', difficulty: 'easy' },
  { word: 'Giraffe', category: 'Animals', difficulty: 'easy' },
  { word: 'Elephant', category: 'Animals', difficulty: 'easy' },
  { word: 'Penguin', category: 'Animals', difficulty: 'easy' },
  { word: 'Kangaroo', category: 'Animals', difficulty: 'medium' },
  { word: 'Dolphin', category: 'Animals', difficulty: 'easy' },
  { word: 'Chameleon', category: 'Animals', difficulty: 'hard' },
  { word: 'Octopus', category: 'Animals', difficulty: 'medium' },

  // Food & Drinks
  { word: 'Pizza slice', category: 'Food & Drinks', difficulty: 'easy' },
  { word: 'Ice Cream Cone', category: 'Food & Drinks', difficulty: 'easy' },
  { word: 'Hamburger', category: 'Food & Drinks', difficulty: 'easy' },
  { word: 'Birthday Cake', category: 'Food & Drinks', difficulty: 'easy' },
  { word: 'Taco', category: 'Food & Drinks', difficulty: 'easy' },
  { word: 'Pineapple', category: 'Food & Drinks', difficulty: 'medium' },

  // Landmarks & Structures
  { word: 'Eiffel Tower', category: 'Landmarks & Structures', difficulty: 'easy' },
  { word: 'Lighthouse', category: 'Landmarks & Structures', difficulty: 'easy' },
  { word: 'Pyramids', category: 'Landmarks & Structures', difficulty: 'easy' },
  { word: 'Windmill', category: 'Landmarks & Structures', difficulty: 'medium' },
  { word: 'Igloo', category: 'Landmarks & Structures', difficulty: 'easy' },

  // Vehicles & Space
  { word: 'Rocket Ship', category: 'Vehicles & Space', difficulty: 'easy' },
  { word: 'Helicopter', category: 'Vehicles & Space', difficulty: 'medium' },
  { word: 'Submarine', category: 'Vehicles & Space', difficulty: 'medium' },
  { word: 'Bicycle', category: 'Vehicles & Space', difficulty: 'easy' },
  { word: 'Hot Air Balloon', category: 'Vehicles & Space', difficulty: 'easy' }
];

export function getRandomWord(): WordEntry {
  const randomIndex = Math.floor(Math.random() * WORD_DICTIONARY.length);
  return WORD_DICTIONARY[randomIndex];
}
