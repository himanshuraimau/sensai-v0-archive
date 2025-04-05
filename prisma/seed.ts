import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Check if we already have users
  const userCount = await prisma.user.count()
  if (userCount > 0) {
    console.log('Database already seeded')
    return
  }

  // Create notification types (needed for references)
  await prisma.notificationType.createMany({
    data: [
      { name: 'New Content', description: 'Notification for new learning materials', iconName: 'FileText' },
      { name: 'Quiz Reminder', description: 'Reminder to complete scheduled quizzes', iconName: 'AlertCircle' },
      { name: 'Learning Streak', description: 'Updates about learning streak status', iconName: 'Calendar' },
      { name: 'Achievement', description: 'Notification for unlocked achievements', iconName: 'Award' },
      { name: 'System', description: 'System-related notifications', iconName: 'Bell' }
    ]
  })
  
  // Create achievement types (needed for references)
  await prisma.achievementType.createMany({
    data: [
      { name: '7-Day Streak', description: 'Study for 7 consecutive days', iconName: 'Calendar', points: 10 },
      { name: 'Quiz Master', description: 'Complete 5 quizzes with a score of 80% or higher', iconName: 'Award', points: 20 },
      { name: 'Fast Learner', description: 'Complete your first course in record time', iconName: 'Clock', points: 15 },
      { name: 'Knowledge Explorer', description: 'Study 3 different subjects', iconName: 'Compass', points: 15 },
      { name: 'Dedicated Learner', description: 'Study for a total of 20 hours', iconName: 'BookOpen', points: 25 },
      { name: 'Perfect Score', description: 'Get 100% on any quiz', iconName: 'Target', points: 30 }
    ]
  })
  
  // Create file categories (needed for references)
  await prisma.fileCategory.createMany({
    data: [
      { name: 'Documents', description: 'Text documents, PDFs, and other written materials' },
      { name: 'Images', description: 'Photos, diagrams, and other visual content' },
      { name: 'Audio', description: 'Sound recordings and audio files' },
      { name: 'Video', description: 'Video recordings and visual content' },
      { name: 'Archives', description: 'Compressed files and archives' },
      { name: 'Other', description: 'Miscellaneous files' }
    ]
  })

  // Create a demo user
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash('Password123!', salt)
  
  const user = await prisma.user.create({
    data: {
      username: 'demo_user',
      email: 'demo@example.com',
      passwordHash: hashedPassword,
      fullName: 'Demo User',
      bio: 'I am a demo user for testing the SensiAI platform.',
      location: 'San Francisco, CA',
      occupation: 'Software Developer',
      isActive: true,
      isVerified: true,
      
      // Create user settings
      settings: {
        create: {
          themeMode: 'light',
          colorTheme: 'yellow'
        }
      }
    }
  })

  // Create default note folders
  const allNotesFolder = await prisma.noteFolder.create({
    data: {
      userId: user.id,
      name: 'All Notes',
      iconName: 'FileText',
      isDefault: true
    }
  })

  await prisma.noteFolder.create({
    data: {
      userId: user.id,
      name: 'Favorites',
      iconName: 'Star',
      isDefault: true
    }
  })

  await prisma.noteFolder.create({
    data: {
      userId: user.id,
      name: 'Trash',
      iconName: 'Trash2',
      isDefault: true
    }
  })
  
  // Create custom folders
  const programmingFolder = await prisma.noteFolder.create({
    data: {
      userId: user.id,
      name: 'Programming',
      iconName: 'Code',
      isDefault: false
    }
  })
  
  const mlFolder = await prisma.noteFolder.create({
    data: {
      userId: user.id,
      name: 'Machine Learning',
      iconName: 'Brain',
      isDefault: false
    }
  })
  
  const webDevFolder = await prisma.noteFolder.create({
    data: {
      userId: user.id,
      name: 'Web Development', 
      iconName: 'Globe',
      isDefault: false
    }
  })

  // Create tags
  const importantTag = await prisma.noteTag.create({
    data: {
      userId: user.id,
      name: 'Important',
      colorCode: 'bg-red-500'
    }
  })
  
  const studyTag = await prisma.noteTag.create({
    data: {
      userId: user.id,
      name: 'Study',
      colorCode: 'bg-blue-500'
    }
  })
  
  const workTag = await prisma.noteTag.create({
    data: {
      userId: user.id,
      name: 'Work',
      colorCode: 'bg-green-500'
    }
  })
  
  const personalTag = await prisma.noteTag.create({
    data: {
      userId: user.id,
      name: 'Personal',
      colorCode: 'bg-purple-500'
    }
  })

  // Create sample notes - I'll add more notes to match the SQLite seed
  const jsBasicsNote = await prisma.note.create({
    data: {
      userId: user.id,
      title: 'JavaScript Basics',
      content: `# JavaScript Basics

## Variables
- var: Function scoped, can be redeclared
- let: Block scoped, can be reassigned
- const: Block scoped, cannot be reassigned

## Data Types
- String: "Hello, world!"
- Number: 42, 3.14
- Boolean: true, false
- Object: { name: "John", age: 30 }
- Array: [1, 2, 3, 4]
- Null: null
- Undefined: undefined

## Functions
\`\`\`javascript
// Function declaration
function add(a, b) {
  return a + b;
}

// Arrow function
const multiply = (a, b) => a * b;
\`\`\`

## Control Flow
\`\`\`javascript
if (condition) {
  // code
} else if (anotherCondition) {
  // code
} else {
  // code
}

for (let i = 0; i < 10; i++) {
  // code
}

while (condition) {
  // code
}
\`\`\`
`,
      folderId: programmingFolder.id,
      isFavorite: true,
      
      // Create version
      versions: {
        create: {
          content: `# JavaScript Basics...`
        }
      },
      
      // Add tags
      tags: {
        create: {
          tagId: studyTag.id
        }
      }
    }
  })
  
  // Create neural networks note
  await prisma.note.create({
    data: {
      userId: user.id,
      title: 'Neural Networks Overview',
      content: `# Neural Networks Overview

Neural networks are a set of algorithms, modeled loosely after the human brain, that are designed to recognize patterns.

## Types of Neural Networks

### 1. Feedforward Neural Networks
The simplest type of artificial neural network. Information moves in only one direction—forward—from the input nodes, through the hidden nodes, and to the output nodes.

### 2. Convolutional Neural Networks (CNNs)
Primarily used for image processing and computer vision tasks. They use convolutional layers to filter inputs for useful information.

### 3. Recurrent Neural Networks (RNNs)
Used for sequential data like time series or natural language. They have connections that form directed cycles, allowing the network to maintain a state or "memory".

### 4. Long Short-Term Memory Networks (LSTMs)
A special kind of RNN capable of learning long-term dependencies, useful for tasks like speech recognition and language modeling.

## Key Concepts

- **Neurons**: The basic computational unit of a neural network.
- **Weights**: Parameters that transform input data within the network.
- **Activation Functions**: Functions that determine the output of a neural network node.
- **Backpropagation**: The algorithm used to calculate gradients for training.
- **Gradient Descent**: The optimization algorithm used to minimize the loss function.

## Applications

- Image and speech recognition
- Natural language processing
- Recommendation systems
- Medical diagnosis
- Game playing
`,
      folderId: mlFolder.id,
      
      // Create version
      versions: {
        create: {
          content: `# Neural Networks Overview...`
        }
      },
      
      // Add tags
      tags: {
        createMany: {
          data: [
            { tagId: studyTag.id },
            { tagId: importantTag.id }
          ]
        }
      }
    }
  })

  // Create learning streak
  await prisma.learningStreak.create({
    data: {
      userId: user.id,
      currentStreak: 7,
      longestStreak: 10,
      lastActivityDate: new Date()
    }
  })

  // Create daily activities for the past week
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    await prisma.dailyActivity.create({
      data: {
        userId: user.id,
        activityDate: date,
        studyTimeMinutes: Math.floor(Math.random() * 120) + 30,
        contentViewed: Math.floor(Math.random() * 5) + 1,
        quizzesCompleted: Math.floor(Math.random() * 2),
        notesCreated: Math.floor(Math.random() * 2)
      }
    })
  }

  console.log('Database seeded successfully')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
