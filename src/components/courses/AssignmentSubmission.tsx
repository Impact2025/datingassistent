'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Upload,
  Link,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  Eye,
  Edit
} from 'lucide-react';

interface Assignment {
  id: number;
  lesson_id: number;
  title: string;
  description: string;
  instructions?: string;
  submission_type: 'text' | 'file' | 'url';
  max_points: number;
}

interface AssignmentSubmission {
  id: number;
  user_id: number;
  assignment_id: number;
  submission_text?: string;
  submission_url?: string;
  submission_file_url?: string;
  score?: number;
  feedback?: string;
  submitted_at: string;
  graded_at?: string;
  graded_by?: number;
}

interface AssignmentSubmissionProps {
  assignment: Assignment;
  onSubmit?: (submission: AssignmentSubmission) => void;
  existingSubmission?: AssignmentSubmission;
  readOnly?: boolean;
}

export function AssignmentSubmission({
  assignment,
  onSubmit,
  existingSubmission,
  readOnly = false
}: AssignmentSubmissionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [submissionText, setSubmissionText] = useState(existingSubmission?.submission_text || '');
  const [submissionUrl, setSubmissionUrl] = useState(existingSubmission?.submission_url || '');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [fileUploading, setFileUploading] = useState(false);

  // Validation
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    validateSubmission();
  }, [submissionText, submissionUrl, submissionFile, assignment.submission_type]);

  const validateSubmission = () => {
    switch (assignment.submission_type) {
      case 'text':
        setIsValid(submissionText.trim().length > 0);
        break;
      case 'url':
        setIsValid(submissionUrl.trim().length > 0 && isValidUrl(submissionUrl));
        break;
      case 'file':
        setIsValid(submissionFile !== null || existingSubmission?.submission_file_url !== undefined);
        break;
      default:
        setIsValid(false);
    }
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Basic file validation
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/jpeg', 'image/png'];

      if (file.size > maxSize) {
        setError('Bestand is te groot. Maximum grootte is 10MB.');
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        setError('Bestandstype niet ondersteund. Gebruik PDF, Word, tekstbestanden of afbeeldingen.');
        return;
      }

      setSubmissionFile(file);
      setError(null);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload/assignment', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Bestand upload mislukt');
    }

    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async () => {
    if (!isValid || readOnly) return;

    setIsSubmitting(true);
    setError(null);

    try {
      let fileUrl = existingSubmission?.submission_file_url;

      // Upload file if new file selected
      if (assignment.submission_type === 'file' && submissionFile) {
        setFileUploading(true);
        fileUrl = await uploadFile(submissionFile);
        setFileUploading(false);
      }

      const submissionData = {
        submission_text: assignment.submission_type === 'text' ? submissionText : undefined,
        submission_url: assignment.submission_type === 'url' ? submissionUrl : undefined,
        submission_file_url: assignment.submission_type === 'file' ? fileUrl : undefined,
      };

      const response = await fetch(`/api/assignments/${assignment.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Opdracht indienen mislukt');
      }

      const submission = await response.json();
      setSuccess('Opdracht succesvol ingediend!');

      // Call onSubmit callback if provided
      if (onSubmit) {
        onSubmit(submission);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is iets misgegaan');
    } finally {
      setIsSubmitting(false);
      setFileUploading(false);
    }
  };

  const getSubmissionTypeIcon = () => {
    switch (assignment.submission_type) {
      case 'text':
        return <FileText className="h-5 w-5" />;
      case 'file':
        return <Upload className="h-5 w-5" />;
      case 'url':
        return <Link className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getSubmissionTypeLabel = () => {
    switch (assignment.submission_type) {
      case 'text':
        return 'Tekst opdracht';
      case 'file':
        return 'Bestand upload';
      case 'url':
        return 'URL/Link';
      default:
        return 'Opdracht';
    }
  };

  const getSubmissionStatus = () => {
    if (!existingSubmission) return null;

    if (existingSubmission.score !== undefined) {
      return {
        status: 'graded',
        label: `Beoordeeld: ${existingSubmission.score}/${assignment.max_points} punten`,
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
        color: 'bg-green-100 text-green-800'
      };
    }

    return {
      status: 'submitted',
      label: 'Ingediend - wacht op beoordeling',
      icon: <Clock className="h-4 w-4 text-yellow-500" />,
      color: 'bg-yellow-100 text-yellow-800'
    };
  };

  const status = getSubmissionStatus();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getSubmissionTypeIcon()}
            <div>
              <CardTitle className="text-lg">{assignment.title}</CardTitle>
              <Badge variant="outline" className="mt-1">
                {getSubmissionTypeLabel()}
              </Badge>
            </div>
          </div>
          {status && (
            <Badge className={status.color}>
              {status.icon}
              <span className="ml-1">{status.label}</span>
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Assignment Description */}
        <div>
          <h4 className="font-medium mb-2">Opdracht omschrijving</h4>
          <p className="text-muted-foreground">{assignment.description}</p>
          {assignment.instructions && (
            <div className="mt-3 p-3 bg-muted rounded-lg">
              <h5 className="font-medium text-sm mb-1">Instructies:</h5>
              <p className="text-sm text-muted-foreground">{assignment.instructions}</p>
            </div>
          )}
          <div className="mt-2 text-sm text-muted-foreground">
            Maximum punten: {assignment.max_points}
          </div>
        </div>

        {/* Existing Submission Display */}
        {existingSubmission && (
          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="h-4 w-4" />
              <span className="font-medium">Jouw inzending</span>
              <span className="text-sm text-muted-foreground">
                ({new Date(existingSubmission.submitted_at).toLocaleDateString('nl-NL')})
              </span>
            </div>

            {existingSubmission.submission_text && (
              <div className="mb-3">
                <Label className="text-sm font-medium">Tekst inzending:</Label>
                <div className="mt-1 p-3 bg-background rounded border text-sm">
                  {existingSubmission.submission_text}
                </div>
              </div>
            )}

            {existingSubmission.submission_url && (
              <div className="mb-3">
                <Label className="text-sm font-medium">URL:</Label>
                <a
                  href={existingSubmission.submission_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline ml-2"
                >
                  {existingSubmission.submission_url}
                </a>
              </div>
            )}

            {existingSubmission.submission_file_url && (
              <div className="mb-3">
                <Label className="text-sm font-medium">Bestand:</Label>
                <a
                  href={existingSubmission.submission_file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline ml-2"
                >
                  Download bestand
                </a>
              </div>
            )}

            {existingSubmission.feedback && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Label className="text-sm font-medium text-blue-800">Feedback:</Label>
                <p className="text-sm text-blue-700 mt-1">{existingSubmission.feedback}</p>
                {existingSubmission.graded_at && (
                  <p className="text-xs text-blue-600 mt-2">
                    Beoordeeld op {new Date(existingSubmission.graded_at).toLocaleDateString('nl-NL')}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Submission Form */}
        {!readOnly && (!existingSubmission || !existingSubmission.score) && (
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Edit className="h-4 w-4" />
              <span className="font-medium">
                {existingSubmission ? 'Opdracht bijwerken' : 'Opdracht indienen'}
              </span>
            </div>

            {/* Text Submission */}
            {assignment.submission_type === 'text' && (
              <div>
                <Label htmlFor="submission-text">Jouw antwoord</Label>
                <Textarea
                  id="submission-text"
                  placeholder="Schrijf hier je antwoord..."
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  className="mt-2 min-h-[120px]"
                  disabled={isSubmitting}
                />
              </div>
            )}

            {/* URL Submission */}
            {assignment.submission_type === 'url' && (
              <div>
                <Label htmlFor="submission-url">URL/Link</Label>
                <Input
                  id="submission-url"
                  type="url"
                  placeholder="https://voorbeeld.nl"
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  className="mt-2"
                  disabled={isSubmitting}
                />
                {submissionUrl && !isValidUrl(submissionUrl) && (
                  <p className="text-sm text-red-500 mt-1">Voer een geldige URL in</p>
                )}
              </div>
            )}

            {/* File Submission */}
            {assignment.submission_type === 'file' && (
              <div>
                <Label htmlFor="submission-file">Bestand uploaden</Label>
                <Input
                  id="submission-file"
                  type="file"
                  onChange={handleFileChange}
                  className="mt-2"
                  disabled={isSubmitting || fileUploading}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                />
                {submissionFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Geselecteerd: {submissionFile.name} ({(submissionFile.size / 1024 / 1024).toFixed(1)}MB)
                  </p>
                )}
                {existingSubmission?.submission_file_url && !submissionFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Huidig bestand blijft behouden. Upload een nieuw bestand om te vervangen.
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-6 flex items-center gap-3">
              <Button
                onClick={handleSubmit}
                disabled={!isValid || isSubmitting || fileUploading}
                className="flex items-center gap-2"
              >
                {isSubmitting || fileUploading ? (
                  <LoadingSpinner />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {existingSubmission ? 'Bijwerken' : 'Indienen'}
              </Button>

              {!isValid && (
                <span className="text-sm text-muted-foreground">
                  Vul alle vereiste velden in om in te dienen
                </span>
              )}
            </div>
          </div>
        )}

        {/* Status Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}