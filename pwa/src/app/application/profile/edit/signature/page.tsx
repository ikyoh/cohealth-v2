"use client";

import PageContent from "@/components/page-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { useGetIRI, usePatchQuery, usePostQuery } from "@/hooks/useQuery";
import { Eraser, PenLine, RotateCcw, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    PointerEvent as ReactPointerEvent,
    useEffect,
    useRef,
    useState,
} from "react";

type SignatureMode = "draw" | "upload";

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 300;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export default function SignaturePage() {
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawingRef = useRef(false);
    const [mode, setMode] = useState<SignatureMode>("draw");
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [hasDrawing, setHasDrawing] = useState(false);
    const [error, setError] = useState("");

    const {
        data: currentUser,
        isLoading: isLoadingCurrentUser,
        isError: isCurrentUserError,
    } = useGetIRI("/current_user");
    const { mutateAsync: createSignature, isPending: isCreating } =
        usePostQuery("media_signatures");
    const { mutateAsync: updateUser, isPending: isUpdating } = usePatchQuery();

    useEffect(() => {
        resetCanvas();
    }, []);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const resetCanvas = () => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");

        if (!canvas || !context) return;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.lineCap = "round";
        context.lineJoin = "round";
        context.lineWidth = 4;
        context.strokeStyle = "#111827";
        setHasDrawing(false);
    };

    const getCanvasPoint = (event: ReactPointerEvent<HTMLCanvasElement>) => {
        const canvas = event.currentTarget;
        const bounds = canvas.getBoundingClientRect();

        return {
            x: (event.clientX - bounds.left) * (canvas.width / bounds.width),
            y: (event.clientY - bounds.top) * (canvas.height / bounds.height),
        };
    };

    const startDrawing = (event: ReactPointerEvent<HTMLCanvasElement>) => {
        const context = event.currentTarget.getContext("2d");
        if (!context) return;

        const point = getCanvasPoint(event);
        event.currentTarget.setPointerCapture(event.pointerId);
        context.beginPath();
        context.moveTo(point.x, point.y);
        isDrawingRef.current = true;
    };

    const draw = (event: ReactPointerEvent<HTMLCanvasElement>) => {
        if (!isDrawingRef.current) return;

        const context = event.currentTarget.getContext("2d");
        if (!context) return;

        const point = getCanvasPoint(event);
        context.lineTo(point.x, point.y);
        context.stroke();
        setHasDrawing(true);
    };

    const stopDrawing = (event: ReactPointerEvent<HTMLCanvasElement>) => {
        if (!isDrawingRef.current) return;

        event.currentTarget.getContext("2d")?.closePath();
        isDrawingRef.current = false;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0] ?? null;
        setError("");

        if (!selectedFile) {
            setFile(null);
            setPreviewUrl("");
            return;
        }

        if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
            setFile(null);
            setPreviewUrl("");
            setError("Utilisez une image PNG, JPEG ou WebP.");
            event.target.value = "";
            return;
        }

        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
    };

    const canvasToFile = async (): Promise<File> => {
        const canvas = canvasRef.current;
        if (!canvas) throw new Error("La zone de signature est indisponible.");

        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, "image/png");
        });

        if (!blob) throw new Error("La signature n’a pas pu être générée.");

        return new File([blob], "signature.png", { type: "image/png" });
    };

    const handleSave = async () => {
        setError("");

        if (!currentUser?.iri || isCurrentUserError) {
            setError("Impossible d’identifier l’utilisateur courant.");
            return;
        }

        if (mode === "draw" && !hasDrawing) {
            setError("Dessinez votre signature avant de l’enregistrer.");
            return;
        }

        if (mode === "upload" && !file) {
            setError("Sélectionnez une image de signature.");
            return;
        }

        try {
            const signatureFile = mode === "draw" ? await canvasToFile() : file;
            if (!signatureFile) return;

            const formData = new FormData();
            formData.append("file", signatureFile);

            const signature = await createSignature(formData);
            await updateUser({
                iri: currentUser.iri,
                signature: signature["@id"],
            });

            router.push("/application/profile");
        } catch {
            setError("L’enregistrement de la signature a échoué.");
        }
    };

    if (isLoadingCurrentUser) {
        return (
            <div className="flex min-h-60 items-center justify-center">
                <Spinner />
            </div>
        );
    }

    const isSaving = isCreating || isUpdating;

    return (
        <PageContent title="Ma signature">
            <div className="w-full max-w-3xl space-y-6">
                <Tabs
                    value={mode}
                    onValueChange={(value) => {
                        setMode(value as SignatureMode);
                        setError("");
                    }}
                >
                    <TabsList>
                        <TabsTrigger value="draw">
                            <PenLine />
                            Dessiner
                        </TabsTrigger>
                        <TabsTrigger value="upload">
                            <Upload />
                            Importer
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="draw" className="space-y-3 pt-3">
                        <div className="overflow-hidden rounded-md border bg-white">
                            <canvas
                                ref={canvasRef}
                                width={CANVAS_WIDTH}
                                height={CANVAS_HEIGHT}
                                aria-label="Zone de dessin de la signature"
                                className="block aspect-3/1 w-full cursor-crosshair touch-none"
                                onPointerDown={startDrawing}
                                onPointerMove={draw}
                                onPointerUp={stopDrawing}
                                onPointerCancel={stopDrawing}
                                onPointerLeave={stopDrawing}
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={resetCanvas}
                                disabled={!hasDrawing || isSaving}
                            >
                                <RotateCcw />
                                Effacer
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="upload" className="space-y-4 pt-3">
                        <div className="space-y-2">
                            <Label htmlFor="signature-file">Fichier de signature</Label>
                            <Input
                                id="signature-file"
                                type="file"
                                accept={ACCEPTED_TYPES.join(",")}
                                onChange={handleFileChange}
                                disabled={isSaving}
                            />
                        </div>
                        <div className="flex aspect-3/1 items-center justify-center overflow-hidden rounded-md border border-dashed bg-white">
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Aperçu de la signature"
                                    className="max-h-full max-w-full object-contain"
                                />
                            ) : (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Eraser className="h-4 w-4" />
                                    Aucun fichier sélectionné
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                {error && (
                    <p role="alert" className="text-sm text-destructive">
                        {error}
                    </p>
                )}

                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="cancel"
                        onClick={() => router.back()}
                        disabled={isSaving}
                    >
                        Annuler
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        loading={isSaving}
                    >
                        Enregistrer
                    </Button>
                </div>
            </div>
        </PageContent>
    );
}
