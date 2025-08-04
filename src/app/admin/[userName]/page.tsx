"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams } from "next/navigation";

interface Submission {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  timestamp: string;
}

export default function AdminPage() {
  const params = useParams();
  const userName = params.userName as string;
  
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const MAX_ATTEMPTS = 3;

  // Get password from environment variables
  const getPassword = () => {
    if (userName === "isurika") {
      return process.env.NEXT_PUBLIC_ISURIKA_PASSWORD || "saSA12!@concordAdmin";
    } else if (userName === "tharindu") {
      return process.env.NEXT_PUBLIC_THARINDU_PASSWORD || "taTA12!@concordAdmin";
    }
    return null;
  };

  const ADMIN_PASSWORD = getPassword();

  useEffect(() => {
    // Check if username is valid
    if (!ADMIN_PASSWORD) {
      setError("Invalid username");
      setLoading(false);
      return;
    }

    // Check if page is locked
    const locked = localStorage.getItem(`admin_locked_${userName}`);
    const attemptCount = localStorage.getItem(`admin_attempts_${userName}`);
    
    if (locked === "true") {
      setIsLocked(true);
    }
    
    if (attemptCount) {
      setAttempts(parseInt(attemptCount));
    }
    
    setLoading(false);
  }, [userName, ADMIN_PASSWORD]);

  // Fetch submissions when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('🔍 User authenticated, fetching submissions...');
      fetchSubmissions();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    if (isLocked) {
      setPasswordError("Access is locked. Please redeploy to reset.");
      return;
    }

    if (password === ADMIN_PASSWORD) {
      // Reset attempts on successful login
      setAttempts(0);
      localStorage.removeItem(`admin_attempts_${userName}`);
      localStorage.removeItem(`admin_locked_${userName}`);
      setIsAuthenticated(true);
      fetchSubmissions();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem(`admin_attempts_${userName}`, newAttempts.toString());
      
      if (newAttempts >= MAX_ATTEMPTS) {
        setIsLocked(true);
        localStorage.setItem(`admin_locked_${userName}`, "true");
        setPasswordError("Access locked after 3 failed attempts. Redeploy to reset.");
      } else {
        setPasswordError(`Incorrect password. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
      }
      setPassword("");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSubmissions([]);
    setPassword("");
    setPasswordError("");
  };

  const fetchSubmissions = async () => {
    try {
      console.log('🔍 Fetching submissions...');
      const response = await fetch('/api/contact');
      const data = await response.json();
      console.log('🔍 Fetched data:', data);
      setSubmissions(data.submissions || []);
      console.log('🔍 Set submissions:', data.submissions || []);
    } catch (error) {
      console.error('❌ Error fetching submissions:', error);
      setError('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  // Check if username is valid
  if (!ADMIN_PASSWORD) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Invalid Username</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              Only &quot;isurika&quot; and &quot;tharindu&quot; are valid usernames.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Admin Access - {userName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder={isLocked ? "Access Locked" : "Enter admin password"}
                value={password}
                onChange={(e) => {
                  if (!isLocked) {
                    setPassword(e.target.value);
                    setPasswordError("");
                  }
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isLocked) {
                    handleLogin();
                  }
                }}
                disabled={isLocked}
              />
              {passwordError && (
                <p className="text-red-500 text-sm mt-1">{passwordError}</p>
              )}
              {isLocked && (
                <p className="text-orange-600 text-sm mt-1">
                  🔒 Page is locked. Redeploy the application to reset.
                </p>
              )}
            </div>
            <Button 
              onClick={handleLogin} 
              className="w-full"
              disabled={isLocked}
            >
              {isLocked ? "Access Locked" : "Login"}
            </Button>
            {!isLocked && attempts > 0 && (
              <p className="text-sm text-muted-foreground text-center">
                Failed attempts: {attempts}/{MAX_ATTEMPTS}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Contact Form Submissions</h1>
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Contact Form Submissions</h1>
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Contact Form Submissions</h1>
            <p className="text-sm text-muted-foreground">Logged in as: {userName}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              Total: {submissions.length} submissions
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="text-sm"
            >
              Logout
            </Button>
          </div>
        </div>

        {submissions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No submissions yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {submissions.map((submission) => (
              <Card key={submission.id}>
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
                    <div className="text-xs text-muted-foreground">
                      {new Date(submission.timestamp).toLocaleString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{submission.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 