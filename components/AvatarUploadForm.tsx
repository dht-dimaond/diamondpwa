"use client"
import { useActionState, useState } from "react"
import { Camera, Upload, Loader2 } from "lucide-react"
import { useEffect } from "react"

interface FormState {
  clerkId?: string[];
  avatar?: string[];
  error?: string[];
  success?: boolean;
  avatarUrl?: string;
}

interface AvatarUploadFormProps {
  userId: string;
   //eslint-disable-next-line
  formAction: (prevState: any, formData: FormData) => Promise<FormState>;
}

export default function AvatarUploadForm({
  userId,
  formAction,
}: AvatarUploadFormProps) {
  const [formState, formActionDispatch, isPending] = useActionState(formAction, null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  useEffect(() => {
    if (formState?.success) {
      window.location.reload()
    }
  }, [formState?.success])

  return (
    <form
      action={formActionDispatch}
      className="w-full flex items-center justify-center gap-3 flex-col"
    >
      <input type="hidden" name="clerkId" value={userId} />

      <label className="w-full cursor-pointer bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl p-3 transition-colors flex items-center justify-center">
        <Camera size={20} className="text-black dark:text-white" />
        <span className="text-black dark:text-white font-medium ml-2">
          {selectedFile ? selectedFile.name : "Change Avatar"}
        </span>
        <input
          type="file"
          name="avatar"
          accept="image/*"
          className="hidden"
          required
          onChange={handleFileChange}
        />
      </label>

      {selectedFile && (
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={16} />
              Upload Avatar
            </>
          )}
        </button>
      )}

      {formState?.error && (
        <p className="text-red-500 text-sm">
          {Array.isArray(formState.error) ? formState.error.join(', ') : formState.error}
        </p>
      )}
      {formState?.success && (
        <p className="text-green-500 text-sm">Avatar updated!</p>
      )}
    </form>
  )
}