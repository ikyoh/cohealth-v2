<?php

namespace App\Controller;

use App\Entity\MissionDocument;
use Symfony\Bridge\Doctrine\Attribute\MapEntity;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;

final class MissionDocumentDownloadController extends AbstractController
{
    public function __construct(
        private readonly string $projectDir,
    ) {
    }

    #[Route('/mission_documents/{uuid}/download', name: 'mission_document_download', methods: ['GET'])]
    public function __invoke(
        #[MapEntity(mapping: ['uuid' => 'uuid'])] MissionDocument $document,
    ): BinaryFileResponse {
        $mission = $document->getMission();

        if ($mission === null) {
            throw new NotFoundHttpException();
        }

        $this->denyAccessUnlessGranted('MISSION_VIEW', $mission);

        $filePath = $document->getFilePath();
        $absolutePath = $filePath === null
            ? null
            : $this->projectDir . '/var/mission_documents/' . basename($filePath);

        if ($absolutePath === null || !is_file($absolutePath)) {
            throw new NotFoundHttpException('Le fichier demandé est introuvable.');
        }

        $response = new BinaryFileResponse($absolutePath);
        $response->setContentDisposition(
            ResponseHeaderBag::DISPOSITION_ATTACHMENT,
            $document->getOriginalName() ?? basename($absolutePath),
        );

        if ($document->getMimeType() !== null) {
            $response->headers->set('Content-Type', $document->getMimeType());
        }

        return $response;
    }
}
