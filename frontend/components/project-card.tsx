"use client"

import Link from "next/link"
import { Calendar, Layers, MoreHorizontal, Settings2, FlaskConical } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Project } from "@/lib/mock-data"

interface ProjectCardProps {
  project: Project
}

const statusColors = {
  active: "bg-success/20 text-success border-success/30",
  draft: "bg-warning/20 text-warning border-warning/30",
  archived: "bg-muted text-muted-foreground border-muted",
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold text-card-foreground">
            {project.name}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/projects/${project.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/config-engine?project=${project.id}`}>Open Config Engine</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/simulation?project=${project.id}`}>Run Simulation</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Archive Project</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{project.createdAt}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            <span>{project.integrations} integrations</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={statusColors[project.status]}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </Badge>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" asChild className="h-8">
              <Link href={`/config-engine?project=${project.id}`}>
                <Settings2 className="h-3.5 w-3.5 mr-1.5" />
                Config
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="h-8">
              <Link href={`/simulation?project=${project.id}`}>
                <FlaskConical className="h-3.5 w-3.5 mr-1.5" />
                Simulate
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
