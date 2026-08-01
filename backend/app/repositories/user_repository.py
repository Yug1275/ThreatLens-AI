from sqlalchemy.orm import Session
from app.models.user import User, Profile
from app.schemas.user import UserCreate, ProfileUpdate
from app.core.security import get_password_hash

class UserRepository:
    def get_by_email(self, db: Session, email: str) -> User | None:
        return db.query(User).filter(User.email == email).first()

    def get_by_username(self, db: Session, username: str) -> User | None:
        return db.query(User).filter(User.username == username).first()

    def get(self, db: Session, user_id: int) -> User | None:
        return db.query(User).filter(User.id == user_id).first()

    def create(self, db: Session, obj_in: UserCreate) -> User:
        db_user = User(
            email=obj_in.email,
            username=obj_in.username,
            hashed_password=get_password_hash(obj_in.password),
        )
        db.add(db_user)
        db.flush() # flush to get the user ID
        
        db_profile = Profile(
            user_id=db_user.id,
            first_name=obj_in.first_name,
            last_name=obj_in.last_name
        )
        db.add(db_profile)
        db.commit()
        db.refresh(db_user)
        return db_user
        
    def update_profile(self, db: Session, user_id: int, obj_in: ProfileUpdate) -> Profile | None:
        profile = db.query(Profile).filter(Profile.user_id == user_id).first()
        if not profile:
            return None
            
        update_data = obj_in.model_dump(exclude_unset=True)
        
        # Handle email update on the User model
        if 'email' in update_data:
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                user.email = update_data['email']
            del update_data['email']
            
        for field, value in update_data.items():
            setattr(profile, field, value)
            
        db.commit()
        db.refresh(profile)
        return profile
        
    def update_password(self, db: Session, user_id: int, new_password: str) -> bool:
        user = self.get(db, user_id)
        if not user:
            return False
            
        user.hashed_password = get_password_hash(new_password)
        db.commit()
        return True

user_repository = UserRepository()
