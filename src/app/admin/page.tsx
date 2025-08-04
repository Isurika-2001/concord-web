"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Submission {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  timestamp: string;
}

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/contact');
      const data = await response.json();
      
      if (response.ok) {
        setSubmissions(data.submissions || []);
      } else {
        setError(data.error || 'Failed to fetch submissions');
      }
    } catch (err) {
      setError('Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading submissions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Contact Form Submissions
          </h1>
          <p className="text-xl text-muted-foreground">
            {submissions.length} submission{submissions.length !== 1 ? 's' : ''} received
          </p>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-700 text-center">{error}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {submissions.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No submissions yet. Contact form submissions will appear here.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid gap-6 max-w-4xl mx-auto">
            {submissions.map((submission) => (
              <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {submission.firstName} {submission.lastName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {submission.email}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(submission.timestamp)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed">
                    {submission.message}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <button
            onClick={fetchSubmissions}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Refresh Submissions
          </button>
        </div>
      </div>
    </div>
  );
} 