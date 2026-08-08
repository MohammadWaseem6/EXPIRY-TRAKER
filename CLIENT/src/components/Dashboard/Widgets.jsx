import { Users, Star, Calendar } from "lucide-react";

const Widgets = ({ items, favorites }) => {
  // Team members (simulate from items)
  const teamMembers = items.slice(0, 5).map((item) => ({
    name: item.addedBy?.name || "Unknown",
    initials: item.addedBy?.name?.charAt(0) || "U",
    items: 1,
  }));

  // Upcoming expiries (next 7 days)
  const upcomingItems = items
    .filter((i) => {
      const days = Math.ceil(
        (new Date(i.expiryDate) - new Date()) / (1000 * 60 * 60 * 24),
      );
      return days >= 0 && days <= 7;
    })
    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
    .slice(0, 3);

  const favoriteItems = items
    .filter((item) => favorites.includes(item._id))
    .slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Team Members */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-gray-600" />
          <h3 className="text-sm font-medium text-gray-700">Team Members</h3>
        </div>
        {teamMembers.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-2">
            No team members
          </p>
        ) : (
          <div className="space-y-3">
            {teamMembers.map((member, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                  {member.initials}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">
                    {member.name}
                  </p>
                  <p className="text-xs text-gray-400">{member.items} items</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Favorites */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-yellow-500" />
          <h3 className="text-sm font-medium text-gray-700">Favorite Items</h3>
          <span className="ml-auto text-xs text-gray-400">
            {favorites.length}
          </span>
        </div>
        {favorites.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-2">
            No favorites yet. Star an item!
          </p>
        ) : (
          <div className="space-y-2">
            {favoriteItems.map((item) => (
              <div key={item._id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{item.name}</span>
                <span className="text-xs text-gray-400">{item.category}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Expiries */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-gray-600" />
          <h3 className="text-sm font-medium text-gray-700">
            Upcoming Expiries
          </h3>
        </div>
        {upcomingItems.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-2">
            No expiries this week 🎉
          </p>
        ) : (
          <div className="space-y-2">
            {upcomingItems.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between border-b border-gray-100 pb-1"
              >
                <span className="text-sm text-gray-700">{item.name}</span>
                <span className="text-xs text-orange-500 font-medium">
                  {Math.ceil(
                    (new Date(item.expiryDate) - new Date()) /
                      (1000 * 60 * 60 * 24),
                  )}{" "}
                  days
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Widgets;
