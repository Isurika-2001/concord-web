"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useParams } from "next/navigation";
import { Mail, RefreshCw, LogOut, User, Calendar, MessageSquare } from "lucide-react";

interface Submission {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  timestamp: string;
}

// Loading skeleton component
const SubmissionSkeleton = () => (
  <Card className="animate-pulse">
    <CardHeader className="pb-3">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </CardContent>
  </Card>
);

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

  const handleEmailClick = (email: string, firstName: string, lastName: string) => {
    const subject = encodeURIComponent(`Re: Your message to Concord Tech Solutions`);
    const body = encodeURIComponent(`Dear ${firstName} ${lastName},\n\nThank you for contacting Concord Tech Solutions.\n\nWe have received your message and will get back to you soon.\n\nBest regards,\nConcord Tech Solutions Team`);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
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
              Only "isurika" and "tharindu" are valid usernames.
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Contact Form Submissions</h1>
              <p className="text-sm text-muted-foreground">Logged in as: {userName}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                Loading submissions...
              </div>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="text-sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <SubmissionSkeleton key={index} />
            ))}
          </div>
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
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Contact Form Submissions</h1>
            <p className="text-sm text-muted-foreground">Logged in as: {userName}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="text-sm">
              {submissions.length} submissions
            </Badge>
            <Button 
              variant="outline" 
              onClick={fetchSubmissions}
              className="text-sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="text-sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {submissions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No submissions yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {submissions.map((submission) => (
              <Card key={submission.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-base flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        {submission.firstName} {submission.lastName}
                      </CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(submission.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {new Date(submission.timestamp).toLocaleTimeString()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Email:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEmailClick(submission.email, submission.firstName, submission.lastName)}
                        className="text-xs h-auto p-1 hover:bg-blue-50"
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        {submission.email}
                      </Button>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Message:</p>
                      <p className="text-sm whitespace-pre-wrap line-clamp-3">{submission.message}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 