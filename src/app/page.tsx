"use client"
import Image from 'next/image'
import styles from './page.module.css'
//import { writeFile } from 'fs/promises'
import { join } from 'path'
import FileUploadForm from '@/components/FileUploadForm'

export default function Home() {
  
  //const inputFileRef = useRef<HTMLInputElement | null>(null);

  async function upload(data: FormData) {
    

    console.log('form: ', data)
    const file: File | null = data.get('file') as unknown as File
    if (!file) {
      throw new Error('No file uploaded')
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // With the file data in the buffer, you can do whatever you want with it.
    // For this, we'll just write it to the filesystem in a new location
    const path = join('/', 'tmp', file.name)
    //await writeFile(path, buffer)
    //console.log(`open ${path} to see the uploaded file`)

    return { success: true }
  }

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <div>
          <code className={styles.code}>bg-remover</code>
        </div>
      </div>

    <div className={styles.uploadform}>
      <FileUploadForm />
    </div>

      {/* <form action={upload}>
        <input type="file" multiple ref={inputFileRef} name="file" />
        <input type="submit" value="Upload" />
      </form> */}

      <div className={styles.grid}>
        <a
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Docs <span>-&gt;</span>
          </h2>
          <p>Find in-depth information about Next.js features and API.</p>
        </a>

        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Learn <span>-&gt;</span>
          </h2>
          <p>Learn about Next.js in an interactive course with&nbsp;quizzes!</p>
        </a>

        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Templates <span>-&gt;</span>
          </h2>
          <p>Explore the Next.js 13 playground.</p>
        </a>

        <a
          href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className={styles.card}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            Deploy <span>-&gt;</span>
          </h2>
          <p>
            Instantly deploy your Next.js site to a shareable URL with Vercel.
          </p>
        </a>
      </div>
    </main>
  )
}
