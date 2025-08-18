#!/usr/bin/env python3
"""Simple script to test backend connectivity"""

import requests
import sys

def test_backend():
    print("🧪 Testing Backend Connectivity...")
    
    try:
        # Test root endpoint
        print("Testing root endpoint...")
        response = requests.get('http://127.0.0.1:8000/', timeout=5)
        print(f"✅ Root endpoint: {response.status_code}")
        print(f"Response: {response.json()}")
        
        # Test health endpoint  
        print("\nTesting health endpoint...")
        response = requests.get('http://127.0.0.1:8000/health', timeout=5)
        print(f"✅ Health endpoint: {response.status_code}")
        print(f"Response: {response.json()}")
        
        # Test API docs
        print("\nTesting API documentation...")
        response = requests.get('http://127.0.0.1:8000/docs', timeout=5)
        print(f"✅ API docs available: {response.status_code}")
        
        print("\n🎉 Backend is running and responsive!")
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend on http://127.0.0.1:8000")
        print("Make sure the FastAPI server is running")
        return False
    except Exception as e:
        print(f"❌ Error testing backend: {e}")
        return False

if __name__ == "__main__":
    success = test_backend()
    sys.exit(0 if success else 1)
