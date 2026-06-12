"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useGetIRI } from "@/hooks/useQuery"
import { request } from "@/utils/axios.utils"
import dayjs from "@/utils/dayjs.config"
import { Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

const categories = [
  { value: "NURSING", label: "Soins infirmiers" },
  { value: "PHYSIOTHERAPY", label: "Physiothérapie" },
  { value: "MEDICAL_EQUIPMENT", label: "Médicaments et matériel médical" },
  { value: "PERSONAL_ASSISTANCE", label: "Aide à la personne" },
]

const emptyMandate = () => ({
  category: "NURSING",
  beginDate: dayjs().format("YYYY-MM-DD"),
  description: "",
})

export default function MandateForm() {
  const router = useRouter()
  const { data: currentUser, isLoading } = useGetIRI("/current_user")
  const [patient, setPatient] = useState({
    firstname: "",
    lastname: "",
    birthDate: "",
    phone: "",
    address: "",
    city: "",
  })
  const [mandates, setMandates] = useState([emptyMandate()])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  if (isLoading) return null

  if (!currentUser?.roles?.includes("ROLE_PRINCIPAL")) {
    return (
      <Card>
        <CardContent className="pt-6">
          Seul un mandant peut créer un dossier de mandats.
        </CardContent>
      </Card>
    )
  }

  const updateMandate = (index: number, field: string, value: string) => {
    setMandates(current => current.map((mandate, mandateIndex) =>
      mandateIndex === index ? { ...mandate, [field]: value } : mandate
    ))
  }

  const submit = async () => {
    if (!patient.firstname.trim() || !patient.lastname.trim()) {
      setError("Le prénom et le nom du patient sont obligatoires.")
      return
    }

    if (mandates.some(mandate => !mandate.description.trim() || !mandate.beginDate)) {
      setError("Chaque mandat doit avoir une date de début et une description.")
      return
    }

    setIsSaving(true)
    setError("")

    try {
      await request({
        url: "/mandate_groups",
        method: "post",
        data: {
          patient,
          mandates: mandates.map(mandate => ({
            category: mandate.category,
            beginDate: mandate.beginDate,
            description: mandate.description,
          })),
        },
      })
      router.push("/application/mandates")
    } catch (submitError: any) {
      setError(submitError?.response?.data?.detail || "Le dossier n’a pas pu être créé.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.4fr)]">
      <Card>
        <CardHeader><CardTitle>Patient</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="Prénom" value={patient.firstname} onChange={value => setPatient({ ...patient, firstname: value })} />
          <Field label="Nom" value={patient.lastname} onChange={value => setPatient({ ...patient, lastname: value })} />
          <Field label="Date de naissance" type="date" value={patient.birthDate} onChange={value => setPatient({ ...patient, birthDate: value })} />
          <Field label="Téléphone" value={patient.phone} onChange={value => setPatient({ ...patient, phone: value })} />
          <Field label="Adresse" value={patient.address} onChange={value => setPatient({ ...patient, address: value })} />
          <Field label="Ville" value={patient.city} onChange={value => setPatient({ ...patient, city: value })} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Mandats
            <Button type="button" variant="outline" size="sm" onClick={() => setMandates([...mandates, emptyMandate()])}>
              <Plus /> Ajouter
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mandates.map((mandate, index) => (
            <div key={index} className="space-y-4 rounded-md border p-4">
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={mandates.length === 1}
                  onClick={() => setMandates(current => current.filter((_, currentIndex) => currentIndex !== index))}
                >
                  <Trash2 />
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select value={mandate.category} onValueChange={value => updateMandate(index, "category", value)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Field
                  label="Début souhaité"
                  type="date"
                  value={mandate.beginDate}
                  onChange={value => updateMandate(index, "beginDate", value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={mandate.description}
                  onChange={event => updateMandate(index, "description", event.target.value)}
                />
              </div>
            </div>
          ))}
          {error && <p className="text-destructive text-sm">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="cancel" onClick={() => router.back()}>Annuler</Button>
            <Button type="button" loading={isSaving} disabled={isSaving} onClick={submit}>
              Transmettre au coordinateur
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={event => onChange(event.target.value)} />
    </div>
  )
}
