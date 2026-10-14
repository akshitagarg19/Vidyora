"""
Dynamic Live Test for Vidyora (100% Unscripted)
Tests:
1. Adding a brand new, completely unknown topic dynamically.
2. Asking a real, spontaneous question on it.
3. Checking Gemini's live generated response and citation.
"""
import asyncio
from app.services.rag_service import rag_orchestrator

async def test_unscripted_live_flow():
    print("=" * 65)
    print("TESTING DYNAMIC UNSCRIPTED RAG (ZERO HARDCODING)")
    print("=" * 65)

    # 1. Simulate user uploading a brand-new custom topic (e.g. Diffusion Models & Stable Diffusion)
    print("\n1. Ingesting brand new unseen syllabus content dynamically...")
    rag_orchestrator.add_new_document(
        text=(
            "Diffusion models work by gradually adding Gaussian noise to an image during the forward process "
            "over T timesteps, and training a U-Net neural network to reverse this denoising process step-by-step "
            "to generate photo-realistic images from pure random noise."
        ),
        source_type="pdf",
        reference="Page 88",
        doc_id="diffusion_models_handbook.pdf",
        topic="Diffusion Models",
        page_no=88
    )

    # 2. Spontaneous User Doubt (Hinglish me puchenge)
    doubt = "Diffusion models me image generate karne ke liye reverse denoising me kwnsa neural network use hota hai aur kaise kaam karta hai?"
    print(f"\n2. Student asking spontaneous doubt: \n'{doubt}'")

    print("\n3. Sending to live Gemini with dynamic context...")
    response = await rag_orchestrator.execute_grounded_tutoring(doubt, language="hinglish")

    print("\n" + "=" * 65)
    print("LIVE GEMINI GENERATED ANSWER:")
    print("=" * 65)
    print(response.answer)
    print("\nCITATIONS GENERATED:")
    for cit in response.citations:
        print(f"  * [{cit.reference}] from {cit.doc_id} (Score: {cit.similarity_score})")

    # 3. Test Unknown/Out-of-Syllabus Doubt (e.g. Cricket World Cup)
    out_of_syllabus_doubt = "Virat Kohli ne kitne century banaye hain ODI me?"
    print(f"\n4. Asking out-of-syllabus doubt: '{out_of_syllabus_doubt}'")
    refusal_response = await rag_orchestrator.execute_grounded_tutoring(out_of_syllabus_doubt)
    print("SYSTEM REFUSAL RESPONSE:")
    print(f"  * Answer: {refusal_response.answer}")
    print(f"  * In Syllabus: {refusal_response.is_in_syllabus}")
    print("=" * 65)

if __name__ == "__main__":
    asyncio.run(test_unscripted_live_flow())
