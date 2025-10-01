import { CodeView } from './code-view'
import { Button } from './ui/button'
import { CopyButton } from './ui/copy-button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Download, FileText, ChevronRight, ChevronDown, Folder } from 'lucide-react'
import { useState } from 'react'

export function FragmentCode({
  files,
}: {
  files: { name: string; content: string }[]
}) {
  const [currentFile, setCurrentFile] = useState(files[0].name)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']))
  const currentFileContent = files.find(
    (file) => file.name === currentFile,
  )?.content

  function download(filename: string, content: string) {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  function toggleFolder(folderPath: string) {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath)
    } else {
      newExpanded.add(folderPath)
    }
    setExpandedFolders(newExpanded)
  }

  // Build file tree structure
  interface TreeNode {
    name: string
    path: string
    isFile: boolean
    children: TreeNode[]
  }

  function buildFileTree(): TreeNode {
    const root: TreeNode = { name: '/', path: '/', isFile: false, children: [] }
    
    files.forEach((file) => {
      const parts = file.name.split('/').filter(p => p)
      let currentNode = root
      let currentPath = ''
      
      parts.forEach((part, index) => {
        currentPath += '/' + part
        const isFile = index === parts.length - 1
        
        let child = currentNode.children.find(c => c.name === part)
        if (!child) {
          child = { name: part, path: currentPath, isFile, children: [] }
          currentNode.children.push(child)
        }
        currentNode = child
      })
    })
    
    return root
  }

  function renderTreeNode(node: TreeNode, depth: number = 0): JSX.Element[] {
    if (node.name === '/' && depth === 0) {
      return node.children.flatMap(child => renderTreeNode(child, depth))
    }

    const elements: JSX.Element[] = []
    const isExpanded = expandedFolders.has(node.path)

    if (node.isFile) {
      elements.push(
        <div
          key={node.path}
          className={`flex gap-1 select-none cursor-pointer items-center text-sm px-2 py-1 hover:bg-muted ${
            currentFile === node.path ? 'bg-muted' : ''
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => setCurrentFile(node.path)}
        >
          <FileText className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs">{node.name}</span>
        </div>
      )
    } else {
      elements.push(
        <div
          key={node.path}
          className="flex gap-1 select-none cursor-pointer items-center text-sm px-2 py-1 hover:bg-muted"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => toggleFolder(node.path)}
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          )}
          <Folder className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-medium">{node.name}</span>
        </div>
      )

      if (isExpanded) {
        node.children.forEach(child => {
          elements.push(...renderTreeNode(child, depth + 1))
        })
      }
    }

    return elements
  }

  const fileTree = buildFileTree()

  return (
    <div className="flex h-full">
      {/* File tree sidebar */}
      <div className="w-64 border-r border-border overflow-y-auto bg-background/50">
        <div className="py-2">
          {renderTreeNode(fileTree)}
        </div>
      </div>
      
      {/* Code view */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center px-2 pt-1 gap-2 border-b border-border">
          <div className="flex flex-1 items-center">
            <span className="text-xs text-muted-foreground font-mono">{currentFile}</span>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <CopyButton
                    content={currentFileContent || ''}
                    className="text-muted-foreground"
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom">Copy</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground"
                    onClick={() =>
                      download(currentFile, currentFileContent || '')
                    }
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Download</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="flex flex-col flex-1 overflow-x-auto">
          <CodeView
            code={currentFileContent || ''}
            lang={currentFile.split('.').pop() || ''}
          />
        </div>
      </div>
    </div>
  )
}
