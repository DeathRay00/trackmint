import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.lookup_tables import UserRole

def test_register_user(client: TestClient, db_session: Session):
    """Test user registration."""
    # Create a role first
    role = UserRole(
        id="test-role-id",
        name="TestRole",
        description="Test role"
    )
    db_session.add(role)
    db_session.commit()
    db_session.refresh(role)
    
    user_data = {
        "email": "newuser@example.com",
        "password": "newpassword123",
        "first_name": "New",
        "last_name": "User",
        "role_id": str(role.id),
        "is_active": True
    }
    
    response = client.post("/api/auth/register", json=user_data)
    assert response.status_code == 200
    
    data = response.json()
    assert data["email"] == user_data["email"]
    assert data["first_name"] == user_data["first_name"]
    assert data["last_name"] == user_data["last_name"]
    assert "id" in data

def test_register_duplicate_email(client: TestClient, test_user):
    """Test registration with duplicate email fails."""
    user_data = {
        "email": test_user.email,
        "password": "password123",
        "first_name": "Test",
        "last_name": "User",
        "role_id": str(test_user.role_id),
        "is_active": True
    }
    
    response = client.post("/api/auth/register", json=user_data)
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]

def test_login_success(client: TestClient, test_user):
    """Test successful login."""
    login_data = {
        "username": test_user.email,
        "password": "testpassword"
    }
    
    response = client.post("/api/auth/login", data=login_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_credentials(client: TestClient):
    """Test login with invalid credentials fails."""
    login_data = {
        "username": "nonexistent@example.com",
        "password": "wrongpassword"
    }
    
    response = client.post("/api/auth/login", data=login_data)
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]

def test_login_inactive_user(client: TestClient, db_session: Session):
    """Test login with inactive user fails."""
    # Create inactive user
    role = UserRole(
        id="inactive-role-id",
        name="InactiveRole",
        description="Inactive role"
    )
    db_session.add(role)
    db_session.commit()
    db_session.refresh(role)
    
    inactive_user = User(
        id="inactive-user-id",
        email="inactive@example.com",
        password_hash="$2b$12$test_hash",
        first_name="Inactive",
        last_name="User",
        role_id=role.id,
        is_active=False
    )
    db_session.add(inactive_user)
    db_session.commit()
    
    login_data = {
        "username": inactive_user.email,
        "password": "password123"
    }
    
    response = client.post("/api/auth/login", data=login_data)
    assert response.status_code == 400
    assert "Inactive user" in response.json()["detail"]

def test_oauth_login(client: TestClient, test_user):
    """Test OAuth2 compatible login."""
    from fastapi.security import OAuth2PasswordRequestForm
    
    form_data = OAuth2PasswordRequestForm(
        username=test_user.email,
        password="testpassword"
    )
    
    response = client.post("/api/auth/login/oauth", data=form_data.__dict__)
    assert response.status_code == 200
    
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_password_reset_request(client: TestClient, test_user):
    """Test password reset request."""
    reset_data = {"email": test_user.email}
    
    response = client.post("/api/auth/password-reset", json=reset_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "message" in data
    assert "password reset link" in data["message"]

def test_password_reset_confirm(client: TestClient):
    """Test password reset confirmation."""
    reset_data = {
        "token": "test_token",
        "new_password": "newpassword123"
    }
    
    response = client.post("/api/auth/password-reset/confirm", json=reset_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "message" in data
    assert "reset successfully" in data["message"]
