# Nano Banana | Google | Image Editing

**URL:** https://replicate.com/google/nano-banana

---

Replicate is joining Cloudflare
cmd+k
Explore
Pricing
Enterprise
Docs
Blog
Sign in
Try for free
google/nano-banana
google
/
nano-banana 
Copy

Google's latest image editing model in Gemini 2.5

Warm
Official
52M runs
$0.039 per output image
Commercial use
Playground
API
Examples
README
Input
Form
JSON
Node.js
Python
HTTP
prompt
*
string
Shift + Return to add a new line
Make the sheets in the style of the logo. Make the scene natural. 
A text description of the image you want to generate
image_input
file[]

Add multiple files

https://replicate.delivery/pbxt/NbYIclp4A5HWLsJ8lF5KgiYSNaLBBT1jUcYcHYQmN1uy5OnN/tmpcqc07f_q.png
https://replicate.delivery/pbxt/NbYId45yH8s04sptdtPcGqFIhV7zS5GTcdS3TtNliyTAoYPO/Screenshot%202025-08-26%20at%205.30.12%E2%80%AFPM.png
Input images to transform or use as reference (supports multiple images)

Default: []

aspect_ratio
string
match_input_image
1:1
2:3
3:2
3:4
4:3
4:5
5:4
9:16
16:9
21:9
Aspect ratio of the generated image

Default: "match_input_image"

output_format
string
jpg
png
Format of the output image

Default: "jpg"

Sign in to run this model

Sign in with GitHub

By signing in, you agree to our
terms of service and privacy policy

Output
Preview
JSON
Generated in
10.5 seconds
Tweak it
Iterate in playground
Share
Download
Report
View full prediction
Show logs
Examples

View more examples 

 
Pricing
$0.039
per output image

or around 25 images for $1

Check out our docs for more information about how pricing works on Replicate. Looking for volume pricing? Get in touch.

Readme
Nano Banana

Google’s state-of-the-art image generation and editing model designed for fast, conversational, and multi-turn creative workflows.

Overview

Gemini 2.5 Flash Image (internally codenamed “nano-banana”) is a multimodal model that natively understands and generates images. This model combines high-quality image generation with powerful editing capabilities, all controlled through natural language prompts. It’s designed for creators who need precise control over their visual content while maintaining efficiency and ease of use.

Key Features
Character and Style Consistency

Maintain the same character, object, or style across multiple prompts and images. Place a character in different environments, showcase products from multiple angles, or generate consistent brand assets without time-consuming fine-tuning.

Multi-Image Fusion

Seamlessly blend multiple input images into a single, cohesive visual. Integrate products into new scenes, restyle environments by combining different elements, or merge reference images to create unified compositions.

Conversational Editing

Make precise, targeted edits using natural language descriptions. Blur backgrounds, remove objects, alter poses, add color to black-and-white photos, or make any other transformation by simply describing what you want.

Visual Reasoning

Leverage Gemini’s deep world knowledge for complex tasks that require genuine understanding. The model can interpret hand-drawn diagrams, follow multi-step instructions, and generate images that adhere to real-world logic and context.

Native Image Understanding

The model natively understands and generates images as part of its core architecture, enabling seamless workflows for both creation and editing without switching between different tools or models.

What Makes It Special

Gemini 2.5 Flash Image stands out for its ability to understand context and maintain visual coherence across edits. Unlike traditional image generation models that excel only at aesthetics, this model benefits from Gemini’s extensive world knowledge, allowing it to handle tasks like reading hand-drawn diagrams, understanding spatial relationships, and following complex creative directions.

The model is particularly effective at preserving subject identity across generations. Whether you’re creating a series of marketing images featuring the same product or developing character-consistent artwork for storytelling, the model maintains recognizable features without requiring additional training or fine-tuning.

Intended Use

This model is designed for:

Creative professionals who need consistent visual assets across campaigns
Product designers visualizing items in different contexts and angles
Marketers creating cohesive brand materials with consistent styling
Content creators generating character-consistent imagery for storytelling
Developers building applications that require conversational image editing
Educators creating visual materials that require semantic understanding
Limitations

While Gemini 2.5 Flash Image is highly capable, there are some areas where it may not always deliver perfect results:

Small faces and fine facial details may occasionally lack precision
Complex text rendering within images may sometimes have spelling inconsistencies
Character consistency, while strong, may not be 100% reliable in all scenarios
Very intricate fine details may require multiple refinement iterations

The model is actively being improved to address these limitations.

How It Works

The model processes both text and image inputs through its multimodal architecture. When generating or editing images, it uses its understanding of the Gemini model family’s world knowledge to interpret requests contextually. For editing tasks, it can analyze existing images and apply transformations based on natural language descriptions. For generation tasks, it can reference multiple input images to maintain consistency or blend elements together.

All images created or edited with this model include SynthID watermarking technology, which embeds an invisible digital watermark to help identify AI-generated or AI-edited content.

Performance

Gemini 2.5 Flash Image demonstrates state-of-the-art performance in image editing tasks, as validated by LMArena benchmarks where it tested under the codename “nano-banana.” The model generates images 2-3 times faster than comparable models while maintaining high quality, making it particularly well-suited for applications requiring quick iteration and real-time creative workflows.

Ethical Considerations

Google applies extensive filtering and data labeling to minimize harmful content in training datasets and reduce the likelihood of harmful outputs. The model undergoes red teaming and safety evaluations including content safety, child safety, and representation assessments.

The built-in SynthID watermarking ensures transparency by allowing AI-generated and AI-edited images to be identified, promoting responsible use of AI-generated visual content.

Tips for Best Results
Be specific with descriptions: Detailed prompts yield more accurate results
Use natural language: Describe edits conversationally as you would to a human designer
Iterate progressively: Make changes step-by-step rather than requesting complex multi-part edits at once
Reference visual templates: When maintaining consistency, use the same reference images across generations
Leverage multi-image fusion: Combine up to three images to achieve complex compositions
Experiment with aspect ratios: The model supports multiple aspect ratios for different use cases
Additional Resources

For detailed API documentation and implementation guides, visit the Gemini API documentation.

Try the model yourself on the Replicate Playground to explore its capabilities and see how it can enhance your creative workflow.

Model created 3 months, 1 week ago
Model updated 2 weeks ago
All services are online
HomeAboutChangelogJoin usTermsPrivacyStatusSupport