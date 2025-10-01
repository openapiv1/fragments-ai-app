import { handleAPIError } from '@/lib/api-errors'
import { getModelClient, LLMModel, LLMModelConfig } from '@/lib/models'
import { applyPatch } from '@/lib/morph'
import { FragmentSchema, morphEditSchema, MorphEditSchema } from '@/lib/schema'
import { generateObject, LanguageModel, CoreMessage } from 'ai'

export const maxDuration = 300

// System prompt is constructed dynamically below using the current file context

export async function POST(req: Request) {
  const {
    messages,
    model,
    config,
    currentFragment,
  }: {
    messages: CoreMessage[]
    model: LLMModel
    config: LLMModelConfig
    currentFragment: FragmentSchema
  } = await req.json()

  // Note: Morph editing is currently disabled for multi-file fragments
  // This route needs to be updated to support editing multiple files
  return new Response(
    JSON.stringify({ error: 'Morph editing is not supported for multi-file fragments' }),
    {
      status: 501,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}
