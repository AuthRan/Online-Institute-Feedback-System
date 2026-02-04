import './LoadingSkeleton.css'

export const CardSkeleton = () => (
    <div className="skeleton skeleton-card"></div>
)

export const TextSkeleton = () => (
    <div className="skeleton skeleton-text"></div>
)

export const TitleSkeleton = () => (
    <div className="skeleton skeleton-title"></div>
)

export const CoursesGridSkeleton = () => (
    <div className="courses-grid">
        {[1, 2, 3, 4].map(i => (
            <CardSkeleton key={i} />
        ))}
    </div>
)
