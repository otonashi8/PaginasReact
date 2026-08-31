<?php

declare(strict_types=1);

namespace App\Modules\Forms\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Forms\Http\Resources\FormSubmissionResource;
use App\Modules\Forms\Infrastructure\Persistence\Models\FormSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class FormSubmissionController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => FormSubmissionResource::collection(
                FormSubmission::query()->latest()->get()
            )->resolve(),
        ]);
    }

    public function storeContacto(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        return $this->store($data + ['form_type' => 'contacto']);
    }

    public function storeReclamacion(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'document' => ['required', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'order_number' => ['nullable', 'string', 'max:100'],
            'case_type' => ['required', 'in:Reclamo,Queja'],
            'message' => ['required', 'string', 'max:10000'],
            'requested_solution' => ['required', 'string', 'max:5000'],
        ]);

        return $this->store($data + ['form_type' => 'reclamacion']);
    }

    public function updateStatus(Request $request, FormSubmission $formSubmission): JsonResponse
    {
        $data = $request->validate(['status' => ['required', 'in:Pendiente,En revisión,Respondido,Resuelto,Cerrado']]);
        $formSubmission->update($data);

        return response()->json(['success' => true, 'data' => (new FormSubmissionResource($formSubmission))->resolve()]);
    }

    private function store(array $data): JsonResponse
    {
        $submission = FormSubmission::create([
            ...$data,
            'status' => 'Pendiente',
        ]);

        return response()->json(['success' => true, 'data' => (new FormSubmissionResource($submission))->resolve()], 201);
    }
}
