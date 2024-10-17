'use client'

import { Alert, AlertIcon, AlertDescription } from "@chakra-ui/react"

export default function FormAlert({errorText}: {errorText: string}) {
  return (
    <Alert status="error" rounded="md">
      <AlertIcon/>
      <AlertDescription>
          {errorText}
      </AlertDescription>
    </Alert>
  )
}