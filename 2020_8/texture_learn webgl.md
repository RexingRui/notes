## Texture

*Texture mapping* is fundamental to creating realistic renderings and the GPU’s hardware contains *texture units* to support *texture mapping*.   

- a *texture unit* (emphasis on **unit**) is designed for texture map processing.gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS)
-  A *texture object* stores the data needed for *texture mapping*
- You can create as many *texture objects* as your want, but the number of *texture units* in the GPU determines how many texture maps you can use concurrently in a *shader program*.
- The size of a *texture object* is related to the size of the texture mapping image. You should make your texture mapping images as small as possible to conserve GPU memory.

#### basic steps to create texture mapping are as follows

1. When building the model:
   1. Select an appropriate image for the texture mapping.
   2. Assign an appropriate texture coordinate, (s,t), to each vertex of a triangle.
2. JavaScript pre-processing for a canvas rendering:
   1. Download the texture map image from the server.
   2. Create and fill a GPU *texture object* with the image.
   3. Set the parameters that control how the texture map image is used.
   4. Get the location of a `uniform Sample2D` variable from the *shader program*.
3. JavaScript setup each time a model is rendered using a texture map:
   1. Bind a *texture object* to a *texture unit*
   2. Bind a *texture unit* to a `uniform` shader variable.
4. Shader program
   1. In the *vertex shader*, creating a `varying` variable that will interpolate the texture coordinates across the surface of a triangle.
   2. In the *fragment shader*, use the texture coordinates to lookup a color from the texture image.

#### Create *Texture Objects* in the GPU

the memory that stores a texture mapping image is called a *texture object* instead of a *buffer object*. A *texture object* stores an image and all of the related state variables needed to produce a texture mapping. You can create as many *texture objects* as a GPU has memory to store.  

- Create a new *texture object*
- Set the parameters that control how the *texture object* is used.
- Copy an image into the *texture object*

### Texture Mapping Using Procedures

The colors come from a *mapping*, which is a function that converts a set of inputs into an output value. 

- Lookup the output value from a list of possible values. This is called a ‘table lookup’. In computer graphics this is called *image based texture mapping*.
- Perform calculations on a set of inputs to produce an output value.

*Procedural texture mapping* converts input values into a color. The input values can be anything related to a triangle’s attributes, such as its location, orientation, diffuse color, etc..

*Procedural texture mapping* is performed by *fragment shader* programs. There is no limit to the complexity of such programs, but added complexity means slower rendering. 

- gradients
- overlay
- 