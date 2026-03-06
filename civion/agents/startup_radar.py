"""
CIVION Agent — Startup Radar
Monitors HackerNews for new AI startups and product launches.
"""

from civion.agents.base_agent import BaseAgent, AgentResult
from civion.services.api_service import api
from civion.services.llm_service import llm
import random

class StartupRadarAgent(BaseAgent):
    name = "StartupRadar"
    description = "Monitors HackerNews for new AI startups and product launches"
    interval = 3600 * 4  # Run every 4 hours
    personality = "Explorer"
    tags = ["startup", "ai", "hackernews"]

    async def run(self) -> AgentResult:
        # Fetch top stories from HackerNews
        top_stories_url = "https://hacker-news.firebaseio.com/v0/topstories.json"
        story_ids = await api.get(top_stories_url)
        
        if not story_ids or not isinstance(story_ids, list):
            return AgentResult(success=False, title="", content="Failed to fetch HackerNews", events=[])
            
        # Get details for the top 10 stories
        stories = []
        for sid in story_ids[:10]:
            story = await api.get(f"https://hacker-news.firebaseio.com/v0/item/{sid}.json")
            if story and story.get("title"):
                stories.append(f"- {story.get('title')} ({story.get('url', 'no url')})")
                
        stories_text = "\n".join(stories)

        # Analyze with LLM
        prompt = f"""
        Analyze these top HackerNews stories and identify any new AI startups, product launches, or major tech news.
        Summarize the findings in a concise report.
        Stories:
        {stories_text}
        """
        
        analysis = await llm.generate(
            prompt=prompt,
            system=self.personality_prompt()
        )
        
        # Emit an event (simulating a location for the tech hub)
        locations = [
            {"lat": 37.7749, "lon": -122.4194, "name": "San Francisco, USA"},
            {"lat": 37.3875, "lon": -122.0575, "name": "Silicon Valley, USA"},
            {"lat": 51.5074, "lon": -0.1278, "name": "London, UK"}
        ]
        loc = random.choice(locations)

        return AgentResult(
            success=True,
            title="Startup Radar: HackerNews Trending AI",
            content=analysis,
            events=[{
                "topic": "Startup Discovery",
                "description": analysis[:150] + "...",
                "latitude": loc["lat"],
                "longitude": loc["lon"],
                "location": loc["name"],
            }]
        )
