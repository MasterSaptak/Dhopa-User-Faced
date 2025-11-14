"use client"

import { useMemo, useState } from "react"
import { useStore } from "@/lib/store"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, getServiceItemFinalPrice, getAddonFinalPrice, getDeliveryOptionFinalPrice } from "@/lib/utils"
import type { ServiceItem, Discount } from "@/lib/types"

type DiscountMode = "none" | Discount["type"]

const discountOptions = [
  { value: "none", label: "No discount" },
  { value: "flat", label: "Flat (₹)" },
  { value: "percent", label: "Percent (%)" },
] satisfies { value: DiscountMode; label: string }[]

const generateId = (prefix: string) => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

interface EditableItemProps {
  categoryId: string
  item: ServiceItem
}

function EditableServiceItem({ categoryId, item }: EditableItemProps) {
  const updateServiceItem = useStore((state) => state.updateServiceItem)
  const deleteServiceItem = useStore((state) => state.deleteServiceItem)
  const [form, setForm] = useState({
    name: item.name,
    price: item.price.toString(),
    description: item.description ?? "",
    icon: item.icon ?? "",
    image: item.image ?? "",
    discountType: (item.discount?.type ?? "none") as DiscountMode,
    discountValue: item.discount ? item.discount.value.toString() : "",
    discountNote: item.discount?.note ?? "",
  })
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    setSaving(true)
    const price = Number.parseFloat(form.price) || 0
    let discount: Discount | undefined
    if (form.discountType !== "none") {
      const value = Number.parseFloat(form.discountValue)
      if (!Number.isNaN(value) && value > 0) {
        discount = {
          type: form.discountType,
          value,
          note: form.discountNote.trim() || undefined,
        }
      }
    }
    updateServiceItem(categoryId, item.id, {
      name: form.name.trim(),
      price,
      description: form.description.trim() || undefined,
      icon: form.icon.trim() || undefined,
      image: form.image.trim() || undefined,
      discount,
    })
    setSaving(false)
  }

  return (
    <div className="rounded-xl border border-border/40 bg-background/40 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Input
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            className="font-medium"
          />
          <Textarea
            value={form.description}
            placeholder="Short description"
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            rows={2}
          />
        </div>
        <div className="flex gap-3">
          <Input
            type="number"
            min="0"
            step="0.5"
            value={form.price}
            onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
            className="w-24"
          />
          <Button variant="outline" onClick={handleSave} disabled={saving}>
            Save
          </Button>
          <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => deleteServiceItem(categoryId, item.id)}>
            Remove
          </Button>
        </div>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label>Icon / Emoji</Label>
          <Input
            value={form.icon}
            maxLength={6}
            placeholder="e.g. 🧺"
            onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <Label>Image URL</Label>
          <Input
            value={form.image}
            placeholder="https://example.com/icon.png"
            onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
          />
        </div>
      </div>
      {(form.icon || form.image) && (
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Preview:</span>
          {form.image ? (
            <img src={form.image} alt={form.name || "preview"} className="h-8 w-8 rounded-lg object-cover" />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-base">
              {form.icon}
            </span>
          )}
        </div>
      )}
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label>Discount type</Label>
          <Select
            value={form.discountType}
            onValueChange={(value: DiscountMode) => setForm((prev) => ({ ...prev, discountType: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {discountOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {form.discountType !== "none" && (
          <>
            <div className="space-y-1">
              <Label>Discount value</Label>
              <Input
                type="number"
                min="0"
                value={form.discountValue}
                onChange={(e) => setForm((prev) => ({ ...prev, discountValue: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Discount note</Label>
              <Input
                value={form.discountNote}
                onChange={(e) => setForm((prev) => ({ ...prev, discountNote: e.target.value }))}
                placeholder="Optional label (e.g. Winter offer)"
              />
            </div>
          </>
        )}
      </div>
      <div className="mt-3 text-sm text-muted-foreground">
        Final price:&nbsp;
        <span className="font-semibold text-foreground">
          {formatCurrency(
            getServiceItemFinalPrice({
              price: Number.parseFloat(form.price) || 0,
              discount:
                form.discountType !== "none" && form.discountValue
                  ? {
                      type: form.discountType,
                      value: Number.parseFloat(form.discountValue) || 0,
                    }
                  : undefined,
            }),
          )}
        </span>
      </div>
    </div>
  )
}

interface NewItemFormProps {
  categoryId: string
  onAdd: (item: ServiceItem) => void
}

function NewServiceItemForm({ categoryId, onAdd }: NewItemFormProps) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    icon: "",
    image: "",
    discountType: "none" as DiscountMode,
    discountValue: "",
    discountNote: "",
  })

  const handleSubmit = () => {
    const price = Number.parseFloat(form.price)
    if (!form.name.trim() || Number.isNaN(price)) return
    let discount: Discount | undefined
    if (form.discountType !== "none") {
      const value = Number.parseFloat(form.discountValue)
      if (!Number.isNaN(value) && value > 0) {
        discount = {
          type: form.discountType,
          value,
          note: form.discountNote.trim() || undefined,
        }
      }
    }
    onAdd({
      id: generateId("svc"),
      name: form.name.trim(),
      price,
      category: categoryId,
      description: form.description.trim() || undefined,
      icon: form.icon.trim() || undefined,
      image: form.image.trim() || undefined,
      discount,
    })
    setForm({
      name: "",
      price: "",
      description: "",
      icon: "",
      image: "",
      discountType: "none",
      discountValue: "",
      discountNote: "",
    })
  }

  return (
    <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 space-y-3">
      <p className="text-sm font-semibold text-primary">Add new item</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label>Item name</Label>
          <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
        </div>
        <div className="space-y-1">
          <Label>Base price (₹)</Label>
          <Input
            type="number"
            min="0"
            step="0.5"
            value={form.price}
            onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label>Icon / Emoji</Label>
          <Input
            value={form.icon}
            maxLength={6}
            placeholder="e.g. 🧦"
            onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <Label>Image URL</Label>
          <Input
            value={form.image}
            placeholder="https://example.com/image.png"
            onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
          />
        </div>
      </div>
      {(form.icon || form.image) && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Preview:</span>
          {form.image ? (
            <img src={form.image} alt="Item preview" className="h-8 w-8 rounded-lg object-cover" />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-base">
              {form.icon}
            </span>
          )}
        </div>
      )}
      <Textarea
        value={form.description}
        onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
        placeholder="Short description"
        rows={2}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <Select
          value={form.discountType}
          onValueChange={(value: DiscountMode) => setForm((prev) => ({ ...prev, discountType: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Discount type" />
          </SelectTrigger>
          <SelectContent>
            {discountOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.discountType !== "none" && (
          <>
            <Input
              type="number"
              min="0"
              placeholder="Value"
              value={form.discountValue}
              onChange={(e) => setForm((prev) => ({ ...prev, discountValue: e.target.value }))}
            />
            <Input
              placeholder="Note (optional)"
              value={form.discountNote}
              onChange={(e) => setForm((prev) => ({ ...prev, discountNote: e.target.value }))}
            />
          </>
        )}
      </div>
      <Button onClick={handleSubmit} disabled={!form.name || !form.price}>
        Add item
      </Button>
    </div>
  )
}

export default function AdminPage() {
  const {
    isAdmin,
    loginAdmin,
    logoutAdmin,
    serviceCategories,
    addServiceItem,
    updateAddonCatalog,
    addonsCatalog,
    deliveryOptionsCatalog,
    updateDeliveryOption,
  } = useStore()

  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")

  const handleLogin = () => {
    const ok = loginAdmin(password.trim())
    if (!ok) {
      setLoginError("Invalid admin password.")
    } else {
      setLoginError("")
    }
  }

  const sortedCategories = useMemo(() => serviceCategories, [serviceCategories])

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-900 via-slate-950 to-blue-950 px-4">
        <Card className="glass w-full max-w-md space-y-4 p-6">
          <h1 className="text-2xl font-bold text-center">Admin Access</h1>
          <div className="space-y-2">
            <Label htmlFor="admin-pass">Admin password</Label>
            <Input
              id="admin-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter secure password"
            />
            {loginError && <p className="text-sm text-destructive">{loginError}</p>}
          </div>
          <Button className="w-full" onClick={handleLogin} disabled={!password}>
            Login
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950/90 pb-24">
      <div className="container mx-auto px-4 py-10 space-y-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">DHOPA Admin Console</h1>
            <p className="text-sm text-cyan-100/80">
              Manage service catalog, add-ons, and delivery pricing in real time.
            </p>
          </div>
          <Button variant="outline" onClick={logoutAdmin}>
            Logout
          </Button>
        </div>

        <Card className="glass space-y-6 p-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Service categories</h2>
            <p className="text-sm text-cyan-100/80">Edit prices, descriptions, and discounts per item.</p>
          </div>
          <div className="space-y-8">
            {sortedCategories.map((category) => (
              <div key={category.id} className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-primary">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    )}
                  </div>
                  <Badge variant="outline">{category.items.length} items</Badge>
                </div>
                <div className="space-y-4">
                  {category.items.map((item) => (
                    <EditableServiceItem key={item.id} categoryId={category.id} item={item} />
                  ))}
                </div>
                <NewServiceItemForm
                  categoryId={category.id}
                  onAdd={(newItem) => addServiceItem(category.id, newItem)}
                />
                <Separator className="my-6" />
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="glass p-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Add-ons</h2>
              <p className="text-sm text-cyan-100/80">Adjust pricing and descriptions for optional services.</p>
            </div>
            <div className="space-y-4">
              {addonsCatalog.map((addon) => {
                const finalPrice = getAddonFinalPrice(addon)
                const hasDiscount = addon.discount && finalPrice !== addon.price
                return (
                  <div key={addon.id} className="rounded-xl border border-border/40 bg-background/40 p-4 space-y-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <Input
                        value={addon.name}
                        onChange={(e) =>
                          updateAddonCatalog(addon.id, { name: e.target.value, id: addon.id })
                        }
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          className="w-24"
                          value={addon.price}
                          onChange={(e) =>
                            updateAddonCatalog(addon.id, { price: Number.parseFloat(e.target.value) || 0 })
                          }
                        />
                        <span className="text-sm text-muted-foreground">
                          Final: {formatCurrency(finalPrice)}
                        </span>
                      </div>
                    </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label>Icon / Emoji</Label>
                      <Input
                        value={addon.icon ?? ""}
                        maxLength={6}
                        placeholder="🧴"
                        onChange={(e) => updateAddonCatalog(addon.id, { icon: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Image URL</Label>
                      <Input
                        value={addon.image ?? ""}
                        placeholder="https://..."
                        onChange={(e) => updateAddonCatalog(addon.id, { image: e.target.value })}
                      />
                    </div>
                  </div>
                  {(addon.icon || addon.image) && (
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Preview:</span>
                      {addon.image ? (
                        <img src={addon.image} alt={addon.name} className="h-8 w-8 rounded-lg object-cover" />
                      ) : (
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-base">
                          {addon.icon}
                        </span>
                      )}
                    </div>
                  )}
                    <Textarea
                      value={addon.description ?? ""}
                      onChange={(e) => updateAddonCatalog(addon.id, { description: e.target.value })}
                      placeholder="Description"
                      rows={2}
                    />
                    <div className="grid gap-2 sm:grid-cols-3">
                      <Select
                        value={(addon.discount?.type ?? "none") as DiscountMode}
                        onValueChange={(value: DiscountMode) => {
                          let newDiscount: Discount | undefined
                          if (value === "none") {
                            newDiscount = undefined
                          } else {
                            newDiscount = {
                              type: value,
                              value: addon.discount?.value ?? 0,
                              note: addon.discount?.note,
                            }
                          }
                          updateAddonCatalog(addon.id, { discount: newDiscount })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {discountOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {(addon.discount?.type ?? "none") !== "none" && (
                        <>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Value"
                            value={addon.discount?.value ?? ""}
                            onChange={(e) =>
                              updateAddonCatalog(addon.id, {
                                discount: {
                                  type: addon.discount?.type ?? "flat",
                                  value: Number.parseFloat(e.target.value) || 0,
                                  note: addon.discount?.note,
                                },
                              })
                            }
                          />
                          <Input
                            placeholder="Note"
                            value={addon.discount?.note ?? ""}
                            onChange={(e) =>
                              updateAddonCatalog(addon.id, {
                                discount: addon.discount
                                  ? { ...addon.discount, note: e.target.value }
                                  : undefined,
                              })
                            }
                          />
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card className="glass p-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Delivery options</h2>
              <p className="text-sm text-cyan-100/80">Update delivery radius pricing and express fees.</p>
            </div>
            <div className="space-y-4">
              {deliveryOptionsCatalog.map((option) => {
                const finalPrice = getDeliveryOptionFinalPrice(option)
                const hasDiscount = option.discount && finalPrice !== option.price
                return (
                  <div key={option.id} className="rounded-xl border border-border/40 bg-background/40 p-4 space-y-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <Input
                        value={option.name}
                        onChange={(e) => updateDeliveryOption(option.id, { name: e.target.value })}
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          className="w-24"
                          value={option.price}
                          onChange={(e) =>
                            updateDeliveryOption(option.id, { price: Number.parseFloat(e.target.value) || 0 })
                          }
                        />
                        <span className="text-sm text-muted-foreground">
                          Final: {formatCurrency(finalPrice)}
                        </span>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label>Icon / Emoji</Label>
                        <Input
                          value={option.icon ?? ""}
                          maxLength={6}
                          placeholder="🚚"
                          onChange={(e) => updateDeliveryOption(option.id, { icon: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Image URL</Label>
                        <Input
                          value={option.image ?? ""}
                          placeholder="https://..."
                          onChange={(e) => updateDeliveryOption(option.id, { image: e.target.value })}
                        />
                      </div>
                    </div>
                    {(option.icon || option.image) && (
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Preview:</span>
                        {option.image ? (
                          <img src={option.image} alt={option.name} className="h-8 w-8 rounded-lg object-cover" />
                        ) : (
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-base">
                            {option.icon}
                          </span>
                        )}
                      </div>
                    )}
                    <Textarea
                      value={option.description ?? ""}
                      onChange={(e) => updateDeliveryOption(option.id, { description: e.target.value })}
                      placeholder="Description"
                      rows={2}
                    />
                    <div className="grid gap-2 sm:grid-cols-3">
                      <Select
                        value={(option.discount?.type ?? "none") as DiscountMode}
                        onValueChange={(value: DiscountMode) => {
                          let newDiscount: Discount | undefined
                          if (value === "none") {
                            newDiscount = undefined
                          } else {
                            newDiscount = {
                              type: value,
                              value: option.discount?.value ?? 0,
                              note: option.discount?.note,
                            }
                          }
                          updateDeliveryOption(option.id, { discount: newDiscount })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {discountOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {(option.discount?.type ?? "none") !== "none" && (
                        <>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Value"
                            value={option.discount?.value ?? ""}
                            onChange={(e) =>
                              updateDeliveryOption(option.id, {
                                discount: {
                                  type: option.discount?.type ?? "flat",
                                  value: Number.parseFloat(e.target.value) || 0,
                                  note: option.discount?.note,
                                },
                              })
                            }
                          />
                          <Input
                            placeholder="Note"
                            value={option.discount?.note ?? ""}
                            onChange={(e) =>
                              updateDeliveryOption(option.id, {
                                discount: option.discount
                                  ? { ...option.discount, note: e.target.value }
                                  : undefined,
                              })
                            }
                          />
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

